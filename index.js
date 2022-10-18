const express = require("express");
const app = express();
const port = 3000;

class receipt {
  constructor(inputItem) {
    this.payer = inputItem.payer;
    this.points = inputItem.points;
    this.date = new Date(inputItem.timestamp);
    this.next = null;
  }
}

//linked list of transactions, sorted by timestamp
class receiptList {
  constructor() {
    this.head = null;
    this.pointsHead = null; //first node in the list with non-zero points remaining
  }

  //method to insert a new transaction into the list
  sortedInsert(newItem) {
    let current = this.head;
    // Special case for empty list or new receipt being oldest
    if (this.head == null || newItem.date <= this.head.date) {
      newItem.next = this.head;
      this.head = newItem;
    } else {
      // Locate the node before point of insertion
      while (current.next && newItem.date > current.next.date)
        current = current.next;

      // Either reached end of list or found sweetspot.  time to insert
      newItem.next = current.next;
      current.next = newItem;
    }
    // After insertion, find new pointsHead
    current = this.head;
    while (current.next && current.points == 0) {
      current = current.next;
    }
    this.pointsHead = current;
  }

  //method to return total points in receiptList
  pointsBalance() {
    let count = 0;
    let node = this.pointsHead;
    while (node) {
      count += node.points;
      node = node.next;
    }
    return count;
  }

  //method to return array of unique payers & point totals
  tallyPointsPerPayer() {
    let resultPayers = new Array();
    let resultPoints = new Array();
    let index = 0;
    let node = this.head;
    //iterate through the list
    while (node) {
      //if payer isn't present in resultPayers, add payer & points to their respective arrays
      if (resultPayers.indexOf(node.payer) == -1) {
        resultPayers[index] = node.payer;
        resultPoints[index++] = node.points;
      }
      //if it is present, add its points to resultPoints at the relevant index
      else {
        resultPoints[resultPayers.indexOf(node.payer)] += node.points;
      }
      node = node.next;
    }
    //pack the 2 arrays into an array of objects for JSONification
    let cleanupCrew = new Array();
    for (let i = 0; i < resultPayers.length; i++) {
      cleanupCrew[i] = {
        payer: resultPayers[i],
        points: resultPoints[i],
      };
    }
    return cleanupCrew;
  }

  //method to spend points from the oldest transaction + return the change in points
  spendOldest(debit) {
    let pointsChange = 0;
    //if the current transaction can't handle the cost, set its points to zero & reduce debit accordingly (or grow, if this transaction had negative points)
    if (this.pointsHead.points <= debit) {
      pointsChange = this.pointsHead.points * -1;
      this.pointsHead.points = 0;
      //advance pointsHead to next non-zero transaction
      while (this.pointsHead.points == 0) {
        this.pointsHead = this.pointsHead.next;
      }
    } else {
      //if the current transaction can handle the cost, reduce it by debit
      pointsChange = debit * -1;
      this.pointsHead.points -= debit;
    }
    return pointsChange;
  }

  //method to handle spending of points. returns array of unique involved payers & point changes
  spendPoints(pointsToSpend) {
    let resultPayers = new Array();
    let resultPoints = new Array();
    let index = 0;
    while (pointsToSpend > 0) {
      let currentPayer = this.pointsHead.payer;
      let pointsSpent = 0;
      //if payer isn't present in resultPayers, add payer & points to their respective arrays
      if (resultPayers.indexOf(currentPayer) == -1) {
        resultPayers[index] = currentPayer;
        pointsSpent = this.spendOldest(pointsToSpend);
        resultPoints[index++] = pointsSpent;
      }
      //if it is present, add its points to resultPoints at the relevant index
      else {
        pointsSpent = this.spendOldest(pointsToSpend);
        resultPoints[resultPayers.indexOf(currentPayer)] += pointsSpent;
      }
      pointsToSpend += pointsSpent;
    }
    //pack the 2 arrays into an array of objects for JSONification
    let cleanupCrew = new Array();
    for (let i = 0; i < resultPayers.length; i++) {
      cleanupCrew[i] = {
        payer: resultPayers[i],
        points: resultPoints[i],
      };
    }
    return cleanupCrew;
  }
}

//finally make the darn thing
let bigBoyList = new receiptList();

// when a new receipt item is posted, grab its data & insert it into the list
//in a more complete setup this information would Not be passed through the URL, but such is life
app.post("/add_item/:receivedItem", (req, res) => {
  let newItem = new receipt(JSON.parse(req.params.receivedItem));
  bigBoyList.sortedInsert(newItem);
  res.send("Transaction Added");
});

// when a new spend is posted, check it against the balance, and deduct it if enough
app.post("/spend_points/:value", (req, res) => {
  let pointsToSpend = parseInt(JSON.parse(req.params.value).points);
  if (pointsToSpend > bigBoyList.pointsBalance()) {
    res.send("Insufficient Points");
  } else {
    res.send(JSON.stringify(bigBoyList.spendPoints(pointsToSpend)));
  }
});

// call for a list of payers & their current balances
app.get("/balances", function routeHandler(req, res) {
  res.send(JSON.stringify(bigBoyList.tallyPointsPerPayer()));
});

// 👂
app.listen(port, () => {
  console.log("listening to port", port);
});
