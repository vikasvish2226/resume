# Firebase Setup

This app is Firebase-ready through `src/firebase.ts`. Add these environment variables in `.env.local`:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

The current UI uses localStorage as a runnable demo data adapter. Replace the methods in `src/data.ts` with Firestore/Auth/Storage calls when connecting a live project.

## Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function ownsRestaurant(restaurantId) {
      return signedIn()
        && exists(/databases/$(database)/documents/restaurants/$(restaurantId))
        && get(/databases/$(database)/documents/restaurants/$(restaurantId)).data.ownerId == request.auth.uid;
    }

    match /users/{ownerId} {
      allow read, update, delete: if signedIn() && request.auth.uid == ownerId;
      allow create: if signedIn() && request.auth.uid == ownerId;
    }

    match /restaurants/{restaurantId} {
      allow read: if true;
      allow create: if signedIn() && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if ownsRestaurant(restaurantId);
    }

    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if ownsRestaurant(request.resource.data.restaurantId);
    }

    match /foods/{foodId} {
      allow read: if true;
      allow create, update, delete: if ownsRestaurant(request.resource.data.restaurantId);
    }

    match /orders/{orderId} {
      allow create: if request.resource.data.restaurantId is string
        && request.resource.data.orderStatus == "PLACED"
        && request.resource.data.items is list;
      allow read: if ownsRestaurant(resource.data.restaurantId)
        || resource.data.customerSessionId == request.query.session;
      allow update: if ownsRestaurant(resource.data.restaurantId);
      allow delete: if false;
    }

    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if exists(/databases/$(database)/documents/orders/$(request.resource.data.orderId))
        && get(/databases/$(database)/documents/orders/$(request.resource.data.orderId)).data.orderStatus == "COMPLETED"
        && get(/databases/$(database)/documents/orders/$(request.resource.data.orderId)).data.ratingSubmitted != true;
      allow update, delete: if false;
    }
  }
}
```

## Storage Layout

```text
restaurants/{restaurantId}/logo
restaurants/{restaurantId}/cover
foods/{restaurantId}/{foodId}/image
foods/{restaurantId}/{foodId}/video
qr/{restaurantId}/
```
