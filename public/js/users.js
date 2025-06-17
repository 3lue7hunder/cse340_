'use strict'

 // Get a list of items in inventory based on the classification_id 
 let accountList = document.querySelector("#accountList")
 accountList.addEventListener("change", function () { 
  let account_id = accountList.value 
//   console.log(`classification_id is: ${classification_id}`) 
  let accountIdURL = "/management/getUsers/"+account_id 
  fetch(accountIdURL) 
  .then(function (response) { 
   if (response.ok) { 
    return response.json(); 
   } 
   throw Error("Network response was not OK"); 
  }) 
  .then(function (data) { 
   console.log(data); 
   buildAccountList(data); 
  }) 
  .catch(function (error) { 
   console.log('There was a problem: ', error.message) 
  }) 
 })

// Build inventory items into HTML table components and inject into DOM 
function buildAccountList(data) { 
 let accountDisplay = document.getElementById("accountDisplay"); 
 // Set up the table labels 
 let dataTable = '<thead>'; 
 dataTable += '<tr><th>Account Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
 dataTable += '</thead>'; 
 // Set up the table body 
 dataTable += '<tbody>'; 
 // Iterate over user 
 data.forEach(function (element) {  
  dataTable += `<tr><td>${element.account_firstname} ${element.account_lastname}</td>`; 
  dataTable += `<td><a href='/inv/edit/${element.account_id}' title='Click to update'>Modify</a></td>`; 
  dataTable += `<td><a href='/inv/delete/${element.account_id}' title='Click to delete'>Delete</a></td></tr>`; 
 }) 
 dataTable += '</tbody>'; 
 // Display the contents in the Inventory Management view 
 accountDisplay.innerHTML = dataTable; 
}