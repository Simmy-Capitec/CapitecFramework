import { test, expect } from '@playwright/test';

let favouriteMusic = 'This is a NEW song';

test.beforeAll(async () => {
     // This Example is about my Top 3 favourite music
     // This code runs ONCE before all tests 
     console.log(favouriteMusic);

});
// Test 1 - FavSongs
test('POST /Song Number 1', async ({ request }) => {

     const newSong1 = {
          userId: 1,
          title: 'This is just practice',
          body: 'Shaun Paul'
     };

     console.log('Added a NEW song to the Playlist:', newSong1);

     const response = await request.post('http://localhost:3000/posts', { data: newSong1 });
     expect(response.status()).toBe(200);

     const body = await response.json();
     console.log('Top 1 Favourite  songs: ', body);

});
// Test 2 - FavSongs
test('POST /Song Number 2', async ({ request }) => {

     const newSong2 = {
          userId: 2,
          title: 'And we try this again',
          body: 'Mia Vesco'
     };

     console.log('Added a NEW song to the Playlist:', newSong2);

     const response = await request.post('http://localhost:3000/posts', { data: newSong2 });
     expect(response.status()).toBe(200);

     const body = await response.json();
     console.log('Top 2 Favourite  songs: ', body);

});
// Test 3 - FavSongs
test('POST /Song Number 3', async ({ request }) => {

     const newSong3 = {
          userId: 3,
          title: '3 is a crowd',
          body: 'Best of the Best'
     };

     console.log('Added a NEW song to the Playlist:', newSong3);

     const response = await request.post('http://localhost:3000/posts', { data: newSong3 });
     expect(response.status()).toBe(200);

     const body = await response.json();
     console.log('Top 3 Favourite  songs: ', body);

});