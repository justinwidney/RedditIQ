

/*
* Indetification of subreddit objects
*/

export type PostId = `t3_${string}`;


export type PinnedPostData = {
    postId: PostId;
    postType: string;
};