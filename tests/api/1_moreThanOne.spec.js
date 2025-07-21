import { test, expect } from '@playwright/test';

//We have 3 categories - /POSTS - /USERS - /COMMENTS

// 'http://locahost:3000'

test('Check if a user has created more than one post', async ({ request }) => {

    //DDT - We'll predefine a dynamic variable which we'll dynamically (or in this case statically) give it a value
    const userIdToFilter = 1;

    //This is mostly familiar and now we change the jsonplaceholder url to our node express api server, when we're looking for a specific user(entry)
    //and we want to to dynamically input a variable to the url, we preface (denote) it with a '?', in this case 'posts?userId=${userIdToFiler}
    const response = await request.get(`http://localhost:3000/posts?userId=${userIdToFilter}`);
    //Simple expect, status code to be 200 - 200 meaning???? - OK!!!!
    expect(response.status()).toBe(200);

    //This is our traditional parsing of the response from our request to json (Typically called 'body' (in our examples) but in this case we call it 'posts')
    const posts = await response.json();



    console.log(posts);
    //This is an automation-tester facing line - facing line meaning that this is expected of you (and the code haha) to make these expectations/assertions throughout code
    //expect(Array.isArray(posts)).toBe(true);

    // //Check that all returned posts have the correct userId
    // for (const post of posts) {
    //     expect(post.userId).toBe(userIdToFilter);
    // }

    //>= 1 -including one \\ >=0 - including 0 \\ > 1

    expect(posts.length).toBeGreaterThanOrEqual(2); // Posts 1, 3, 7 intially belongto user 1


});