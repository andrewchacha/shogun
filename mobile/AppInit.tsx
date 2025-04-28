import {useSystem} from '@/hooks/api/useSystem';
import {useRefreshAccessToken} from '@/hooks/accounts/useRefreshAccessToken';
import {useLinkAccounts} from '@/hooks/accounts/useLinkAccounts';

export function AppInit() {
    useLinkAccounts();
    useSystem();
    useRefreshAccessToken();
    return null;
}
