// 📘 1. Log Lundi into the BookHub platform
fetch('https://bookhub.com/api/login', {
     method: 'POST',
     headers: {
          'Content-Type': 'application/json' // Tell the server we're sending JSON
     },
     body: JSON.stringify({
          username: 'lundi_reader',         // User's login name
          password: 'BooksAreLife2025'      // User's password (example only)
     })
})
     .then(res => res.json())              // Convert response to JSON
     .then(data => console.log('[LOGIN SUCCESS]', data)) // Log login success response
     .catch(err => console.error('[LOGIN ERROR]', err)); // Log any login errors


// 🛒 2. Place a new book order for Lundi
fetch('https://bookhub.com/api/orders', {
     method: 'POST',
     headers: {
          'Content-Type': 'application/json' // Required for POSTing JSON data
     },
     body: JSON.stringify({
          userId: 1024, // Example user ID for Lundi
          books: [
               //This is object 1 (book 1) - from the books array
               {
                    id: 'bk101',
                    title: 'JavaScript for Beginners',
                    pages: 5
               },
               //This is object 2 (book 2) - from the books array
               {
                    id: 'bk102',
                    title: 'The Art of Reading',
                    pages: 10
               },
               {
                    id: 'bk103',
                    title: 'Hello World',
                    pages: 10
               }

          ],
          paymentMethod: 'credit_card' // Payment method chosen
     })
})
     .then(res => res.json())
     .then(data => console.log('[ORDER PLACED]', data))
     .catch(err => console.error('[ORDER ERROR]', err));


// ✍️ 3. Submit a book review as Lundi
fetch('https://bookhub.com/api/reviews', {
     method: 'POST',
     headers: {
          'Content-Type': 'application/json' // Always set for JSON POST
     },
     body: JSON.stringify({
          userId: 1024,               // Lundi’s user ID
          bookId: 'bk101',            // Reviewing book with ID bk101
          rating: 5,                  // 5-star rating
          comment: 'Absolutely loved the hands-on JavaScript exercises!' // Personal review
     })
})
     .then(res => res.json())
     .then(data => console.log('[REVIEW SUBMITTED]', data))
     .catch(err => console.error('[REVIEW ERROR]', err));


// 👤 4. Fetch Lundi’s profile using authorization headers
fetch('https://bookhub.com/api/users/1024', {
     method: 'GET',
     headers: {
          Authorization: 'Bearer real-user-token-lundi-xyz' // Token for secure access
     }
})
     .then(res => res.json())
     .then(data => console.log('[PROFILE INFO]', data))
     .catch(err => console.error('[PROFILE ERROR]', err));


// 📦 5. Track a specific order placed by Lundi
fetch('https://bookhub.com/api/orders/ORD-584203', {
     method: 'GET',
     headers: {
          Authorization: 'Bearer real-user-token-lundi-xyz' // Same token for auth
     }
})
     .then(res => res.json())
     .then(data => console.log('[ORDER STATUS]', data))
     .catch(err => console.error('[TRACKING ERROR]', err));

