const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const User = require("../models/userModel");

const paystack = require("paystack-api")(process.env.TEST_SECRET);
const {
  planChargeSuccess,
  chargeSuccess,
  cancelSubscription,
} = require("../helpers/webhookHelpers");

const addWebhook = async (req, res) => {
  try {
    let data = req.body;
    console.log("Webhook data: ", data);

    switch (data) {
      case (data.event = "invoice.payment_failed"):
        await cancelSubscription(data);
        console.log("Invoice Failed");
        break;
      case (data.event = "invoice.create"):
        console.log("invoice created");
        break;
      case (data.event = "invoice.update"):
        data.data.status == "success"
          ? await planChargeSuccess(data)
          : console.log("Update Failed");
        break;
      case (data.event = "subscription.not_renew"):
        console.log("unrenewed");
        break;
      case (data.event = "subscription.disable"):
        console.log("disabled");
        break;
      case (data.event = "transfer.success"):
        console.log("transfer successful");
        break;
      case (data.event = "transfer.failed"):
        console.log("transfer failed");
        break;
      case (data.event = "transfer.reversed"):
        console.log("transfer reversed");
        break;
      case (data.event = "subscription.disable"):
        console.log("disabled");
        break;

      default:
        // successful charge
        const obj = data.data.plan;
        console.log("Implementing charges logic...");
        // object comparison verifying if its a normal payment or a plan
        // charges for subscription and card
        Object.keys(obj).length === 0 && obj.constructor === Object
          ? await chargeSuccess(data)
          : // charge sub
            await planChargeSuccess(data);
        console.log("Successful");
        break;
    }
  } catch (error) {
    res.status(400).send({ data: {}, error: `${error.message}`, status: 1 });
  }
};

const createPlan = async (req, res) => {
  try {
    const { name, amount, interval } = req.body;

    const response = await paystack.plan.create({
      name,
      amount,
      interval,
    });

    res.status(200).send({
      data: response.data,
      message: response.message,
      status: response.status,
    });
  } catch (error) {
    res.status(400).send({ data: {}, error: `${error.message}`, status: 1 });
  }
};

const getPlans = async (req, res) => {
  try {
    const response = await paystack.plan.list();

    res.status(200).send({
      data: response.data,
      message: response.message,
      status: response.status,
    });
  } catch (error) {
    res.status(400).send({ data: {}, error: `${error.message}`, status: 1 });
  }
};

const initializeTrans = async (req, res) => {
  try {
    let { id } = req.params;
    const { amount } = req.body;
    const plan = process.env.PREMIUM_PLAN_CODE;
    const user = await User.findById(id);
    const email = user.email;
    console.log(email);

    const response = await paystack.transaction.initialize({
      email,
      amount,
      plan,
    });

    const data = {
      paystack_ref: response.data.reference,
      isSubscribed: true,
      planName: plan,
      timeSubscribed: new Date(),
    };

    await User.findByIdAndUpdate(id, data);

    res.status(200).send({
      data: response.data,
      message: response.message,
      status: response.status,
    });
  } catch (error) {
    res.status(400).send({ data: {}, error: `${error.message}`, status: 1 });
  }
};

const verifyTrans = async (req, res) => {
  try {
    let { id } = req.params;
    console.log(id);

    const user = await User.findById(id);

    // Check if the user has a Paystack reference and it's marked as "success"
    if (user.paystack_ref && user.paystack_ref === "success") {
      return res.status(401).send({
        data: {},
        message: "Transaction has been verified",
        status: 1,
      });
    }

    const response = await paystack.transaction.verify({
      reference: user.paystack_ref,
    });
    console.log(response.data.status);

    if (response.data.status === "success") {
      const data = {
        paystack_ref: response.data.reference, // Update with the correct reference
        amountDonated: response.data.amount,
      };
      await User.findByIdAndUpdate(id, data);

      return res.status(200).send({
        data: response.data,
        message: response.message,
        status: response.status,
      });
    } else {
      // Update the user's document with the Paystack reference
      const data = {
        paystack_ref: response.data.reference, // Update with the correct reference
      };
      await User.findByIdAndUpdate(id, data);

      return res.status(200).send({
        data: response.data,
        message: response.message,
        status: response.status,
      });
    }
  } catch (error) {
    res
      .status(400)
      .send({ data: {}, error: `${error.message}`, status: false });
  }
};

// our webhook function for event listening

module.exports = {
  createPlan,
  getPlans,
  addWebhook,
  initializeTrans,
  verifyTrans,
};
