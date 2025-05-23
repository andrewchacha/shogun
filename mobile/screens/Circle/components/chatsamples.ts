import {Avatar} from './Avatars';

export const chatSamples: FeedChatItem[] = [
    {
        id: '1',
        user: {
            name: 'KimHyeMin.sui',
            avatar: 'https://cdn.midjourney.com/660322d6-9fa8-4f04-bb3d-e109f66d067f/0_0.png',
            address: '0xac5bceec1b789ff840d7d4e6ce4ce61c90d190a7f8c4f4ddf0bff6ee2413c33c',
            chain: 'sui',
        },
        content: {
            kind: 'raffle',
            text: 'A raffle game for the community, winner takes all, 1% fees go to rewarding our community.',
            data: {
                address: '0x123',
                pool_size: 235,
                coin: 'USDC',
                ticket_price: 1,
            },
        },
        likes: 100,
        replies: 10,
        timestamp: new Date(Date.now() - 1 * 60 * 1000).getTime(),
    },
    {
        id: '2',
        user: {
            name: 'junior.sui',
            avatar: 'https://cdn.midjourney.com/1ce1c7ef-3535-4dc5-831f-694da024ef5c/0_0.png',
            address: '0xac5bceec1b789ff840d7d4e6ce4ce61c90d190a7f8c4f4ddf0bff6ee2413c33c',
            chain: 'sui',
        },
        content: {
            kind: 'chat',
            text: "Hi community, I'm setting up an offline meetup in Korea for the community. Let's go!",
        },
        avatars: [
            {id: '1', name: 'K', uri: 'https://cdn.midjourney.com/5d8f277a-2313-43e7-905e-e08b857841ee/0_0.png'},
            {id: '2', name: 'K', uri: 'https://cdn.midjourney.com/5c7d280b-0162-4445-a7a1-3c6ec09aa5f9/0_0.png'},
            {id: '3', name: 'K', uri: 'https://cdn.midjourney.com/ecb2cde3-8a2d-49cc-8a25-63aab2139ecd/0_0.png'},
            {id: '4', name: 'K', uri: 'https://cdn.midjourney.com/7e44c8cb-3637-465e-b00c-cd7188bbcc71/0_0.png'},
            {id: '5', name: 'K', uri: 'https://cdn.midjourney.com/15e7585f-38ee-44ce-b670-289fceadea93/0_3.png'},
            {id: '6', name: 'K', uri: 'https://cdn.midjourney.com/65a6bdeb-1a38-4296-b5cd-9b5b1a1dc43a/0_0.png'},
            {id: '7', name: 'K', uri: 'https://cdn.midjourney.com/06d6a46d-60c5-47c4-bae2-21df2d1612cf/0_0.png'},
            {id: '8', name: 'K', uri: 'https://cdn.midjourney.com/3077edff-36a3-45b1-8b7b-4f8c222ec2bb/0_3.png'},
            {id: '9', name: '10+', uri: ''},
        ],
        payRequest: {
            reason: 'Entrance to the Pizza Party',
            amount: 50,
            chain: 'sui',
            address: '0x123',
            coin: 'USDC',
        },
        tip: {
            coin: 'SUI',
            amount: 5.42,
        },
        timestamp: new Date(Date.now() - 2 * 60 * 1000).getTime(),
    },
    {
        id: '3',
        user: {
            name: 'parkara.sui',
            avatar: 'https://cdn.midjourney.com/19e1af5b-aa6e-44ac-b33c-7bdfcddbc1b9/0_1.png',
            address: '0x443cf42b0da43c230bff7a64e69ce25d24d65f49e7c9db6adecc0bd176dba79a',
        },
        content: {
            kind: 'vote',
            text: 'Lets pass a vote to the proposal #5, Please read the proposal carefully.',
            data: {
                address: '0x123',
                title: 'Utilize excess token for ecosystem development',
                for_votes: 235,
                against_votes: 337,
                abstain_votes: 50,
            },
        },
        tip: {
            coin: 'SUI',
            amount: 0.425,
        },
        timestamp: new Date(Date.now() - 4 * 60 * 1000).getTime(),
    },
    {
        id: '4',
        user: {
            name: 'leeminji.sui',
            avatar: 'https://cdn.midjourney.com/8f1aadcd-b7b2-467f-81da-80d5c7a7e42c/0_0.png',
            address: '0x443cf42b0da43c230bff7a64e69ce25d24d65f49e7c9db6adecc0bd176dba79a',
        },
        content: {
            kind: 'prediction',
            text: 'Who will win this upcoming qualifier game?',
            data: {
                options: [
                    {
                        id: '1',
                        text: 'Czech Republic',
                        avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_Czech_Republic.svg/800px-Flag_of_the_Czech_Republic.svg.png',
                        pool_size: 340,
                    },
                    {
                        id: '2',
                        text: 'Montenegro',
                        avatar: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Flag_of_Montenegro.svg',
                        pool_size: 938,
                    },
                ],
                pool_coin: 'USDC',
            },
        },
        tip: {
            coin: 'SUI',
            amount: 2.42,
        },
        timestamp: new Date(Date.now() - 5 * 60 * 1000).getTime(),
    },
];

export type FeedChatKind = 'raffle' | 'vote' | 'chat' | 'prediction';

export type FeedDataRaffle = {
    address: string;
    pool_size: number;
    coin: string;
    ticket_price: number;
};

export type FeedDataPrediction = {
    options: {
        id: string;
        text: string;
        avatar: string;
        pool_size: number;
    }[];
    pool_coin: string;
};

export type FeedDataVote = {
    address: string;
    title: string;
    for_votes: number;
    against_votes: number;
    abstain_votes: number;
};

export type FeedChatRaffle = {
    kind: 'raffle';
    text: string;
    data: FeedDataRaffle;
};

export type FeedChatVote = {
    kind: 'vote';
    text: string;
    data: FeedDataVote;
};

export type FeedChatGeneric = {
    kind: 'chat';
    text: string;
    data?: {
        images: string[];
    };
};

export type FeedChatPrediction = {
    kind: 'prediction';
    text: string;
    data: FeedDataPrediction;
};

export type FeedChatContent = FeedChatRaffle | FeedChatVote | FeedChatGeneric | FeedChatPrediction;

export type FeedChatItem = {
    id: string;
    user: {
        name: string;
        avatar: string;
        address: string;
        chain?: string;
    };
    content: FeedChatContent;
    likes?: number;
    replies?: number;
    avatars?: Avatar[];
    tip?: {
        coin: string;
        amount: number;
    };
    payRequest?: {
        reason: string;
        amount: number;
        chain: string;
        address: string;
        coin: string;
    };
    timestamp: number;
};
