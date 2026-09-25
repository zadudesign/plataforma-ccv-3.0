---
title: Whatsapp Business Cloud modules
slug: whatsapp-business-cloud-modules
image: https://make-cxp-documentation.ams3.cdn.digitaloceanspaces.com/apps-center-icons/PREVIEW_DEFAULT.png
docTags: 
createdAt: 2025-09-01T12:55:54.935Z
---

After connecting to the Whatsapp Business Cloud app, you can use the following modules to build your scenarios.&#x20;

## Message

You can watch events and send messages using the following modules.

:::ExpandableHeading
### Watch Events

Triggers when a new message is received.

| **Webhook name** | Enter a name for the webhook.                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| **Connection**   | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j)                                  |
| **Events**       | Select the event types you want to receive. If you leave the list unchecked, you will receive all events. |
:::

:::ExpandableHeading
### Send a  Message

Sends a message.

You can send a message using this module under the following conditions:

- You can only initiate new chats via **Send a Template** module. Only after sending a templated message to a specific customer and receiving a response from the customer, you can use this **Send a Message** module to send a non-templated message to the customer.
- If a customer contacts you first, then you can reply to the customer with this **Send a Message** module for the next 24 hours.

If you try sending a message while not meeting these conditions the module operation result will appear as success but the message will not reach the customer. Learn about these limitations in WhatsApp's documentation.

| **Connection**   | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Sender ID**    | Select or map the Sender ID from which you want to send the message.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Receiver**     | Enter the receiver's WhatsApp ID or phone number.<br />If you are using a testing number:<br />* You must [register the recipient's number](docId\:RBzoJw76Wjixkkq3dxy5H) in the Facebook Developer console.
* Enter the receiver's phone number without any prefixes such as `+, spaces, (), and _` . For example, if the receiver phone number is `+1-212-345-6789`, then you must enter it as `12123456789`.<br />If you are using your own phone number, the receiver field accepts both WhatsApp ID and a phone number in any dilable format with country code. However, Make recommends explicitly prefixing the country code with a plus sign (+). Some of the examples of supported phone number formats are:<br />* +1-212-345-6789
* +1 (212) 345-6789
* +1 212 345 6789
* +1 (212) 345 6789 |
| **Message Type** | Select the message type. For example, `image`.<br />Based on the selection, dynamic fields auto-populate, and you need to enter the details to send the message. For more details on these dynamic fields, see [WhatsApp Business Cloud Messages API documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages).                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

For any errors, while sending the messages, see the [Troubleshooting](docId\:r0WNMfgzue8t9WabC7h5j) section.
:::

::::ExpandableHeading
### Send a Template Message

:::hint{type="success"}
Your business phone number must be first approved by WhatsApp before you use it for sending messages. For more information, see [Create a business portfolio](docId\:TxcX5IJsAwCWNtGrG5cBn) and [Create a WhatsApp Business account](docId\:TxcX5IJsAwCWNtGrG5cBn) topics.
:::

| **Connection**       | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sender ID**        | Select or map the Sender ID from which you want to send the template message.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Receiver**         | Enter the receiver's WhatsApp ID or phone number in any dialable format.<br />If you are using a testing number:<br />* You must register the recipient's number in the Facebook Developer console.
* Enter the receiver's phone number without any prefixes such as `+, spaces, (), and _` . For example, if the receiver phone number is `+1-212-345-6789`, then you must enter it as `12123456789`.<br />If you are using your own phone number, the receiver field accepts both WhatsApp ID and a phone number in any dialable format with country code. However, Make recommends explicitly prefixing the country code with a plus sign (+). Some of the examples of supported phone number formats are:<br />* +1-212-345-6789
* +1 (212) 345-6789
* +1 212 345 6789
* +1 (212) 345 6789 |
| **Message Template** | Select or map the message template you want to send.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

###
::::

## Media

You can upload and download media using the following modules.

:::ExpandableHeading
### Upload a Media

Uploads a media and retrieves its ID.

| **Connection** | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j)                                                                                                                                                                                                                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sender ID**  | Select or map the ID of a sender whose media you want to upload.                                                                                                                                                                                                                                                                                                                                                                      |
| **File**       | Enter the file details:<br />* File name - Enter the filename including the file extension. For example, `invoice.xls`.
* Data - Enter the path to the file stored in your local directory. For example, "@/local/path/file.jpg".<br />For more information on supported media types, see the [Whatsapp Business Cloud documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#supported-media-types). |
:::

:::ExpandableHeading
### Download a Media

Downloads a media by its ID.

| **Connection** | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j) |
| -------------- | ------------------------------------------------------------------------ |
| **Media ID**   | Enter the Media ID you want to download.                                 |
:::

## Phone Number

You can enable two-step verification, register, verify, and deregister senders using the following modules.

:::ExpandableHeading
### Enable Two-Step Verification

Activates the two-step verification for a sender number by its ID and a 6-digit pin.

| **Connection** | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j)                                                                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sender ID**  | Select or map a Sender ID whose two-step verification you want to enable.                                                                                                                                                                                                       |
| **PIN**        | Enter (map) a 6-digit pin you wish to use for two-step authentication. To disable or reset two-step verification, see the [WhatsApp Business Cloud documentation](https://developers.facebook.com/docs/whatsapp/phone-numbers#resetting-verification-code-in-whatsapp-manager). |
:::

:::ExpandableHeading
### Register a Sender

Registers a sender by its ID and a 6-digit pin.

| **Connection** | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j)                                                                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sender ID**  | Select or map a Sender ID whom you want to register.                                                                                                                                                                                                                 |
| **PIN**        | Enter (map) a 6-digit pin you wish to use for registration. To disable or reset two-step verification, see the [WhatsApp Business Cloud documentation](https://developers.facebook.com/docs/whatsapp/phone-numbers#resetting-verification-code-in-whatsapp-manager). |
:::

:::ExpandableHeading
### Verify a Sender

Verifies a sender by its ID.

| **Connection** | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j)                          |
| -------------- | ------------------------------------------------------------------------------------------------- |
| **Sender ID**  | Select or map a Sender ID whom you want to verify.                                                |
| **Action**     | Select the action you want to perform to verify the sender:<br />* Request a Code
* Verify a Code |
| **By**         | Select a method for receiving the code:<br />* *SMS*
* *Voice*                                    |
| **Code**       | Enter (map) the code received to complete the verification.                                       |
:::

:::ExpandableHeading
### Deregister a Sender

Deregisters a sender by its ID.

| **Connection** | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j) |
| -------------- | ------------------------------------------------------------------------ |
| **Sender ID**  | Select or map a Sender ID of a sender to deregister.                     |
:::

## Business Profile

You can retrieve and update business profiles using the following modules.

:::ExpandableHeading
### Get a Business Profile

Retrieves the details of the WhatsApp business profile by the sender ID.

| **Connection** | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j) |
| -------------- | ------------------------------------------------------------------------ |
| **Sender ID**  | Select or map the Sender ID whose business profile you want to retrieve. |
:::

:::ExpandableHeading
### Update a Business Profile

Updates a WhatsApp business profile by the sender ID.

| **Connection**  | [Connect WhatsApp Business Cloud and Make](docId\:r0WNMfgzue8t9WabC7h5j)                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Sender ID**   | Select or map the Sender ID whose business profile you want to update.                                                                                                                                                                           |
| **Address**     | Enter the address of the business.                                                                                                                                                                                                               |
| **Description** | Enter the business details.                                                                                                                                                                                                                      |
| **Vertical**    | Select or map the industry of the business. For example, `finance`.                                                                                                                                                                              |
| **Email**       | Enter the contact email address of the business.                                                                                                                                                                                                 |
| **Websites**    | Add the business website URL address.<br />For example, a website, Facebook Page, or Instagram. You must include the `http://` or `https://` portion of the URL.                                                                                 |
| **File**        | Enter (map) the file details:<br />* **Profile Picture File Name** - Enter the file name of the profile picture.
* **Profile Picture Data** - Enter the path to the file stored in your local directory. For example, `"@/local/path/file.jpg"`. |
:::
