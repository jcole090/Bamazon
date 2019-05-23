var mysql = require('mysql');
var inquirer = require('inquirer');


var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Jacl.4561',
    database: 'bamazon'
});

connection.connect(error => {
    if (error) {
        console.log('no connection')
    } else {
        console.log('connection successful')
        displayItems();
    }
});

function displayItems() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log(res);
        }
        askQuestions();
    })
}

function askQuestions() {
    inquirer
        .prompt([{
                type: 'input',
                name: 'id',
                message: 'What is the id of the item you want?'
            },
            {
                type: 'input',
                name: 'quantity',
                message: 'How many units do you want?'
            }
        ])
        .then(answers => {
            var id = answers.id;
            var quantity = answers.quantity;
            checkItems(id, quantity)
        });
}

function checkItems(id, amount) {
    connection.query('SELECT * FROM products WHERE item_id = ' + id, function (err, res) {
        if (err) {
            console.log(err)
        } else {
            checkQuantity(res, amount)
        }
    })
}

function checkQuantity(res, amount) {
    var availableStock = res[0].stock_quantity;
    var id = res[0].item_id;
    var price = res[0].price;

    if (amount <= availableStock) {
        //UPDATE THE DATABASE
        connection.query('UPDATE products SET ? WHERE ? ', [{
            stock_quantity: availableStock - amount
        }, {
            item_id: id
        }], function (error) {
            if (error) {
                console.log(error)
            }
        });
    } else {
        console.log('Insufficient quantity')
    }
    inquirer
    .prompt([{
            type: 'confirm',
            name: 'continue',
            message: 'Would you like to keep shopping?'
        }
    ])
    .then(answers => {
        console.log( '\n' + `The total cost of your item is ${price}` + '\n')
        var continueShopping = answers.continue;

        if(continueShopping) {
            displayItems();
        } else {
            console.log('Thanks for shopping with us!')
        }
    });
}