# FetchCodingExercise

### This is a web service with 3 routes:

1. Add a transaction with payer, points, and timestamp
2. Subtract points
3. List current balances of all payers

## Getting the Thing Running

### Things you'll need:

- Download & install [Visual Studio Code](https://code.visualstudio.com/).
- Download & install [NodeJS](https://nodejs.org/en/). I'm running version 16.18.0.
- Have installed some application for the sending of HTTP requests. I used [Postman](https://www.postman.com/downloads/) for this.

### Steps:

1. Open the folder 'FetchCodingExercise' in VS Code. (File > Open Folder...)
2. Open a new terminal window in VS Code. (Terminal > New Terminal)
3. To install the program's dependencies, type `npm install` in the terminal window.
4. To begin the service, type `npm run start:dev` in the terminal window.
5. You should see `listening to port 3000` in the terminal shortly, meaning it's ready for requests on that port!
6. To end the service, Ctrl-C with the terminal focused will bring up the prompt to terminate.

## Add Transaction

Adds a transaction for a specific payer and date.
Successful additions will return "Transaction Added".

### Sample Request:

POST `http://localhost:3000/add_item/{ "payer": "MARIO", "points": 10, "timestamp": "2020-11-02T14:00:00Z" }`

## Spend Points

Spends points from oldest to newest timestamp. Returns a list of payers & points involved for each call.
If not enough points are available, returns "Insufficient Points".

### Sample Request:

POST `http://localhost:3000/spend_points/{ "points": 25 }`

### Sample Return:

`[{"payer":"Mario","points":-10},{"payer":"LUIGI","points":-15}]`

## Return Balances

Returns the current points for each payer.

### Sample Request:

GET `http://localhost:3000/balances`

### Sample Return:

`[{"payer":"Mario","points":0},{"payer":"LUIGI","points":20}]`
