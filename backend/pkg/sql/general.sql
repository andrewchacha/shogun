CREATE SCHEMA IF NOT EXISTS shogun;

CREATE SEQUENCE IF NOT EXISTS shogun.table_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE FUNCTION shogun.next_id(OUT result bigint) AS $$
DECLARE
    our_epoch bigint := 1714220021000;
    seq_id bigint;
    now_millis bigint;
    shard_id int := 5;
BEGIN
    SELECT nextval('shogun.table_id_seq') % 1024 INTO seq_id;
    SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
    result := (now_millis - our_epoch) << 23;
    result := result | (shard_id <<10);
    result := result | (seq_id);
END;
$$ LANGUAGE PLPGSQL;

--- this is a simple script to automate adding a trigger function for each table with updated_at
--- so that on every update it should automatically set updated_at to now
CREATE FUNCTION update_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

--- this script automates adding the trigger to all tables that contains column 'updated_at'
--- it creates the trigger only once for each table, tables with the trigger won't be affected
DO $$
    DECLARE
        table_name text;
    BEGIN
        FOR table_name IN (
            SELECT DISTINCT c.table_name
            FROM information_schema.columns c
                     LEFT JOIN pg_trigger t ON t.tgrelid = c.table_name::regclass
                AND t.tgname = 'update_updated_at_trigger'
            WHERE c.column_name = 'updated_at'
              AND c.table_schema = 'shogun'  -- modified to target the 'shogun' schema
              AND t.tgname IS NULL
        )
            LOOP
                EXECUTE format('CREATE TRIGGER update_updated_at_trigger
                        BEFORE UPDATE ON %I FOR EACH ROW
                        EXECUTE FUNCTION update_updated_at();', table_name);
            END LOOP;
    END $$;
