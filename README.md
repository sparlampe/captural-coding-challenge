# Captural Coding Challenge

This project contains a simple Firebase project written in Typescript. Try it out and make yourself comfortable with the code!

The heart of this project is in the [functions/src/index.ts](./functions/src/index.ts) file which contains the code of a function called "downscaleImage"

# Challenges

## Image downscale challenge

Example of the request
```
{
  imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/Lichtenstein_img_processing_test.png",
  scaleFactor: 0.5
}
```

Requirements:

- validate the body to the incoming request
  - imageUrl not null and must match a url format
  - scaleFactor must be between 0.01 and 0.99
- download image to a temporary folder
- scale image by the given factor
- the response must contain the scaled image as file
- make sure to delete all downloaded files

**Test using**
```
curl -X GET -H "Content-type: application/json" -d '{"imageUrl":"https://upload.wikimedia.org/wikipedia/commons/3/39/Lichtenstein_img_processing_test.png", "scaleFactor":0.05}'  http://localhost:5001/capturalcodingchallenge/us-central1/downscaleImage -OJ
```
## Authentication Challenge
The project uses [Firebase Authentication](https://firebase.google.com/docs/auth)

Requirements:

* make sure that downscaleImage service does not handle requests of anonymous users
* throw an exception if the use is not authenticated

**Test using**
```
curl 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=YOUR_APP_KEY' -H 'Content-Type: application/json' --data-binary '{"email":"your_alias@somemail.com","password":"your_password","returnSecureToken":true}'
curl -X GET -H "Content-type: application/json" -d '{"imageUrl":"https://upload.wikimedia.org/wikipedia/commons/3/39/Lichtenstein_img_processing_test.png", "scaleFactor":0.55}' -H"Authorization:Bearer YOUR_ID_TOKEN" http://localhost:5001/capturalcodingchallenge/us-central1/downscaleImage
```
## Firestore Challenge

Requirements:

* store each raw requests to firestore as a document
* partition the requests by user and store the documents at this location:
  * '/users/{userID}/requests'

**Test using the following and viewing saved entry in the emulator**
```
curl -X GET -H "Content-type: application/json" -d '{"imageUrl":"https://upload.wikimedia.org/wikipedia/commons/3/39/Lichtenstein_img_processing_test.png", "scaleFactor":0.55}' -H"Authorization:Bearer YOUR_ID_TOKEN" http://localhost:5001/capturalcodingchallenge/us-central1/downscaleImage
```

## Firestore Security Challenge
In this challenge you will need to adapt the [firestore.rules](./firestore.rules) file

Requirements:

* users can read and write to their private document and subcollections under '/users/{userID}'
* deny access to any other users

**Test by running the tests**

## Storage Challenge

Example of a request with the upload flag
```
{
  imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/Lichtenstein_img_processing_test.png",
  scaleFactor: 0.5
  upload: true
}
```

Requirements:

* check if the request contains the upload flag
* upload the scaled image to Firebase Storage if the flag is set to true
* return the url of the image on Firebase Storage
* adapt the storage security rules

# Bonus
* add Unit tests infrastructure
* add Unit tests for downscaleImage

# Rules
* Create a repo on Github or Bitbucket and push this project (Don't fork!)
* Make commits as often as possible! (We want see what you do and how you do it)
* When you finish, send us the link to your repo by email
* Please don't spend more than 4 hours on it!


# Why we use coding challenges to interview developers
Hiring is one of the most time-intensive and critical processes. We know there are numbers of different approaches on this (and some pretty passionate opinions about it) but this approach works for us. We first start with a coding challenge (like this one) in order to quickly evaluate the coding level of the candidate. Depending on the results of this challenge, we will invite you for more thorough interviews such as cultural fit and more technical knowledge. Recruiting is a mutual process. Feel free to ask us any questions as well. Good luck!

What we want to evaluate with this coding challenge::

Can you write any code? Basically, we need to see if you can write any code at all. We believe that you can. Still, there are many wantacoders out there and it's difficult to tell from a CV only. Moreover, you’d be surprised how many candidates fall short when it’s time to put the cursor to the editor.

This is a pre-screening and we keep it really short. 1-2h should be fine for a skilled programmer to complete the task. That's the only code you have to write. No online-challenges, coding puzzles or similar... If we are happy with the result, we would like to invite you for further interviews on a personal level.

We know at some companies, it can be frustrating to send in coding challenges and never hear back from them anymore. That's not how we work and think! So, you will get a feedback from us, no matter if we want to continue with you or not.

PROMISED!

Again, Good Luck! The Captural team