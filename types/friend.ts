export type FriendList = {
    receiver: {
        id: string;
        coustumerId: string;
        userdetails: {
            name: string;
            profilephoto?: string | null;
        } | null;
    };
};
