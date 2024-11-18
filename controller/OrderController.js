import { item_db } from "../db/db.js";
import { ItemModel } from "../model/ItemModel.js";

import { customer_db } from "../db/db.js";
import { CustomerModel } from "../model/CustomerModel.js";

import { order_db } from "../db/db.js";
import { OrderModel } from "../model/OrderModel.js";

import { order_details_db } from "../db/db.js";
import { orderModel } from "../model/OrderDetailsModel.js";

let customerIdCB = $("#customer_id1");
let itemIdCB = $("#item_code1");
let orderId = $("#order_id");
let itemName = $("#item_name1");
let price = $("#price1");
let qtyOnHand = $("#qty_on_hand");
let qty = $("#getQty");
let customerName = $("#customer_name1");
let total = $("#total");
let discountInput = $("#discount");
let subTotalInput = $("#sub_total");
let cashInput = $("#Cash");
let balanceInput = $("#balance");

let add = $("#addBtn");
let resetItemDetails = $("#resetItemDetailsBtn");
let submitBtn = $("#submitBtn2");
let updateBtn = $("#updateBtn2");
let deleteBtn = $("#deleteBtn2");
let resetBtn = $("#resetBtn2");
let updateBtn2 = $("#UpdateBtn3");
let removeBtn = $("#removeBtn");

let items = [];

let searchBtn = $("#search");
let searchField = $("#searchField");

let search_order = true;
function generateCurrentDate() {
  $("#order_date").val(getCurrentDate());
}

function getCurrentDate() {
  var currentDate = new Date();
  var formattedDate = currentDate.toLocaleDateString();
  console.log("Current Date: " + formattedDate);
  return formattedDate;
}

$("#order_page").on("click", function () {
  resetBtn.click();
  updateBtn.prop("disabled", true);
  deleteBtn.prop("disabled", true);
  removeBtn.prop("disabled", true);
  updateBtn2.prop("disabled", true);
  searchField.attr("placeholder", "Search Order Id Here");
});

function populateCustomerIDs() {
  customerIdCB.find("option:not(:first-child)").remove();
  for (let i = 0; i < customer_db.length; i++) {
    customerIdCB.append(
      $("<option>", {
        value: customer_db[i].customer_id,
        text: customer_db[i].customer_id,
      })
    );
  }
}

function populateItemIDs() {
  itemIdCB.find("option:not(:first-child)").remove();
  for (let i = 0; i < item_db.length; i++) {
    itemIdCB.append(
      $("<option>", {
        value: item_db[i].itemCode,
        text: item_db[i].itemCode,
      })
    );
  }
}

function generateOrderId() {
  let highestOrderId = 0;

  for (let i = 0; i < order_db.length; i++) {
    const numericPart = parseInt(order_db[i].order_id.split("-")[1]);

    if (!isNaN(numericPart) && numericPart > highestOrderId) {
      highestOrderId = numericPart;
    }
  }

  return `order-${String(highestOrderId + 1).padStart(3, "0")}`;
}

itemIdCB.on("change", function () {
  let selectedValue = $(this).val();

  let itemObj = $.grep(item_db, function (item) {
    return item.itemCode === selectedValue;
  });

  if (itemObj.length > 0) {
    itemName.val(itemObj[0].itemName);
    price.val(itemObj[0].price);
    qtyOnHand.val(itemObj[0].qty);
  }

  let existingItem = items.find((item) => item.itemCode === selectedValue);

  if (existingItem) {
    updateBtn2.prop("disabled", false);
    removeBtn.prop("disabled", false);
    add.prop("disabled", true);
    qty.val(existingItem.qtyValue);
  }
});

customerIdCB.on("change", function () {
  let selectedValue = $(this).val();

  let customerObj = $.grep(customer_db, function (customer) {
    return customer.customer_id === selectedValue;
  });

  if (customerObj.length > 0) {
    customerName.val(customerObj[0].customer_name);
  }
});

function populateItemTable() {
  $("tbody").eq(2).empty();
  items.map((item) => {
    $("tbody")
      .eq(2)
      .append(
        `<tr>
                <th scope="row">${item.itemCode}</th>
                <td>${item.itemName}</td>
                <td>${item.priceValue}</td>
                <td>${item.qtyOnHand}</td>
                <td>${item.qtyValue}</td>
            </tr>`
      );
  });
}

add.on("click", function () {
  let itemCodeValue = itemIdCB.val();
  let qtyValue = parseInt(qty.val());

  if (qtyOnHand.val() >= qtyValue) {
    let itemNameValue = itemName.val();
    let priceValue = price.val();
    let qtyOnHandValue = qtyOnHand.val();

    items.push({
      itemCode: itemCodeValue,
      itemName: itemNameValue,
      priceValue: priceValue,
      qtyOnHand: qtyOnHandValue,
      qtyValue: qtyValue,
    });

    populateItemTable();

    resetItemDetails.click();
  } else {
    showValidationError("Invalid Input", "Out of stock");
  }

  total.val(calculateTotal());
});

updateBtn2.on("click", function () {
  let itemCodeValue = itemIdCB.val();
  let qtyValue = parseInt(qty.val());

  let existingItem = items.find((item) => item.itemCode === itemCodeValue);

  if (existingItem) {
    if (qtyOnHand.val() >= qtyValue) {
      existingItem.qtyValue = qtyValue;

      populateItemTable();

      resetItemDetails.click();
    } else {
      showValidationError("Invalid Input", "Out of stock");
    }
  }

  total.val(calculateTotal());
});

function showValidationError(title, text) {
  Swal.fire({
    icon: "error",
    title: title,
    text: text,
    footer: '<a href="">Why do I have this issue?</a>',
  });
}

resetItemDetails.on("click", function () {
  itemIdCB.val("Select Item Code");
  qty.val("");
  itemName.val("");
  price.val("");
  qtyOnHand.val("");
  updateBtn2.prop("disabled", true);
  removeBtn.prop("disabled", true);
  add.prop("disabled", false);
});

function calculateTotal() {
  let total = 0;
  items.forEach((item) => {
    total += item.priceValue * item.qtyValue;
  });
  return total;
}

discountInput.on("input", function () {
  const discountValue = parseFloat(discountInput.val()) || 0;
  const totalValue = calculateTotal();
  const subtotalValue = totalValue - totalValue * (discountValue / 100);

  subTotalInput.val(subtotalValue);
});

cashInput.on("input", function () {
  const cashValue = parseFloat(cashInput.val()) || 0;
  const totalValue = parseFloat(subTotalInput.val()) || 0;
  const balanceValue = cashValue - totalValue;

  balanceInput.val(balanceValue);
});

submitBtn.on("click", function (e) {
  e.preventDefault();

  const orderDate = $("#order_date").val();
  const orderId = $("#order_id").val();
  const customerId = $("#customer_id1").val();
  const total = $("#total").val();
  const discount = $("#discount").val();
  const cash = $("#Cash").val();

  if (!orderDate) {
    showValidationError("Null Input", "Please select an order date");
    return;
  }

  if (!orderId) {
    showValidationError("Null Input", "Please generate an order ID");
    return;
  }

  if (customerId === "Select Customer Id") {
    showValidationError("Invalid Input", "Please select a customer");
    return;
  }

  if (!total || parseFloat(total) <= 0) {
    showValidationError("Invalid Input", "Total must be a positive number");
    return;
  }

  if (!cash || parseFloat(cash) < 0) {
    showValidationError(
      "Invalid Input",
      "Cash amount must be a positive number"
    );
    return;
  }

  const discountValue = parseFloat(discount);
  if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
    showValidationError(
      "Invalid Input",
      "Discount must be a number between 0 and 100"
    );
    return;
  }

  const order = new OrderModel(
    orderDate,
    orderId,
    customerId,
    total,
    discount,
    cash
  );

  order_db.push(order);

  items.forEach((item) => {
    const orderDetail = new orderModel(
      orderId,
      item.itemCode,
      item.priceValue,
      item.qtyValue
    );
    order_details_db.push(orderDetail);

    item_db.forEach((itemObj) => {
      if (itemObj.itemCode === item.itemCode) {
        itemObj.qty -= item.qtyValue;
      }
    });
  });

  // Display a success message
  Swal.fire(
    "Order Placed Successfully!",
    "The order has been saved.",
    "success"
  );

  resetBtn.click();
});

resetBtn.on("click", function () {
  // Reset the form fields to their initial state
  generateCurrentDate();
  populateCustomerIDs();
  populateItemIDs();
  orderId.val(generateOrderId());
  $("#total").val(""); // Reset the total
  $("#discount").val(""); // Reset the discount
  $("#Cash").val(""); // Reset the cash input
  customerName.val("");
  itemName.val("");
  price.val("");
  qtyOnHand.val("");
  total.val("");
  discountInput.val("");
  cashInput.val("");
  subTotalInput.val("");
  balanceInput.val("");

  items = [];

  $("#item-order-table tbody").empty();

  updateBtn.prop("disabled", true);
  deleteBtn.prop("disabled", true);
  submitBtn.prop("disabled", false);
});

deleteBtn.on("click", function () {
  const orderIdToDelete = orderId.val();

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Delete",
  }).then((result) => {
    if (result.isConfirmed) {
      const indexToDelete = order_db.findIndex(
        (order) => order.order_id === orderIdToDelete
      );
      if (indexToDelete !== -1) {
        order_db.splice(indexToDelete, 1);
      }

      for (let i = 0; i < order_details_db.length; i++) {
        if (order_details_db[i].order_id === orderIdToDelete) {
          order_details_db.splice(i, 1);
        }
      }

      items.forEach((item) => {
        item_db.forEach((itemObj) => {
          if (itemObj.itemCode === item.itemCode) {
            itemObj.qty += item.qtyValue;
          }
        });
      });

      resetBtn.click();

      Swal.fire("Deleted!", "Your file has been deleted.", "success");
    }
  });
});

removeBtn.on("click", function () {
  let index = items.findIndex((item) => item.itemCode === itemIdCB.val());
  items.splice(index, 1);
  populateItemTable();
  resetItemDetails.click();
  total.val(calculateTotal());
});

$("#item-order-table").on("click", "tbody tr", function () {
  let itemCodeValue = $(this).find("th").text();
  let itemNameValue = $(this).find("td:eq(0)").text();
  let priceValue = $(this).find("td:eq(1)").text();
  let qtyOnHandValue = $(this).find("td:eq(2)").text();
  let qtyValue = $(this).find("td:eq(3)").text();

  itemIdCB.val(itemCodeValue);
  itemName.val(itemNameValue);
  price.val(priceValue);
  qtyOnHand.val(qtyOnHandValue);
  qty.val(qtyValue);

  updateBtn2.prop("disabled", false);
  removeBtn.prop("disabled", false);
  add.prop("disabled", true);
});

function populateFields(orderIdValue) {
  let order = order_db.find((order) => order.order_id === orderIdValue);

  if (order) {
    orderId.val(order.order_id);
    $("#order_date").val(order.order_date);
    customerIdCB.val(order.customer_id);
    total.val(order.total);
    discountInput.val(order.discount);

    const discountValue = parseFloat(discountInput.val()) || 0;
    const totalValue = parseFloat(total.val()) || 0;

    const subtotalValue = totalValue - totalValue * (discountValue / 100);
    subTotalInput.val(subtotalValue.toFixed(2));

    cashInput.val(order.cash);

    const cashValue = parseFloat(cashInput.val()) || 0;
    const balanceValue = cashValue - subtotalValue;
    balanceInput.val(balanceValue.toFixed(2));
    let customerObj = $.grep(customer_db, function (customer) {
      return customer.customer_id === order.customer_id;
    });

    if (customerObj.length > 0) {
      customerName.val(customerObj[0].name);
    }

    items = order_details_db
      .filter((orderDetail) => orderDetail.order_id === orderIdValue)
      .map((orderDetail) => {
        let item = item_db.find(
          (item) => item && item.itemCode === orderDetail.item_id
        );

        if (item) {
          return {
            itemCode: item.itemCode,
            itemName: item.itemName,
            priceValue: item.price,
            qtyOnHand: item.qty,
            qtyValue: orderDetail.qty,
          };
        } else {
          console.error(
            `Item not found for item code: ${orderDetail.item_code}`
          );
          return null;
        }
      });

    items = items.filter((item) => item !== null);

    populateItemTable();

    updateBtn.prop("disabled", false);
    deleteBtn.prop("disabled", false);
    submitBtn.prop("disabled", true);
  } else {
    showValidationError(
      "Order Not Found",
      "The selected order details could not be found."
    );
  }
}

searchBtn.on("click", function () {
  if (search_order) {
    populateFields(searchField.val());
    searchField.val("");
  }
});
