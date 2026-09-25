---
title: WhatsApp Business Cloud
slug: whatsapp-business-cloud
image: https://make-cxp-documentation.ams3.digitaloceanspaces.com/apps-center-icons/PREVIEW_whatsapp-business-cloud.png
docTags: 
createdAt: 2025-02-03T13:28:28.554Z
---

::::VerticalSplit{layout="left"}
:::VerticalSplitItem
::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/4CkrlJIBl1di_p1x71ery-Dv-VaPAQ8k7UdBK2xFJ-k-20250829-120858.png" size="50" width="800" height="800" darkWidth="800" darkHeight="800" position="center" showCaption="false"}
:::

:::VerticalSplitItem
With the WhatsApp Business Cloud app in Make, you can monitor events, send a message, and template messages, upload and download media, enable two-step verification, register, verify, and deregister senders, and retrieve and update business profiles in your WhatsApp account.
:::
::::

# Requirements

To use the WhatsApp Business Cloud app in Make, you must have a [Facebook account](https://www.facebook.com), a [Meta Business Suite account](https://www.facebook.com/business/tools/meta-business-suite?content_id=JQiwBnvoH9wrVVx\&ref=sem_smb\&utm_term=meta%20business%20suite\&gclid=CjwKCAiA2PrMBhA4EiwAwpHyC5GyCIcY8yZbH1IS1vTQBfddB41_DlpXum38GcjnqjqJPoNTL7SCmBoCsXgQAvD_BwE\&gad_source=1\&gad_campaignid=21449688669\&gbraid=0AAAAACr-yC-YvKJjCbsd33rFVwgQtUKsl), and a valid [WhatsApp Business number](https://faq.whatsapp.com/1344487902959714). Additionally, you must **turn off** two-step verification for your WhatsApp Business number if it’s enabled.

:::hint{type="info"}
You can use a number that is already registered in the WhatsApp Business App with **Coexistence** mode. This allows you to continue using the WhatsApp Business Cloud app while sending and receiving messages. Note that **Coexistence** mode is not supported in every country. Check the [Facebook documentation](https://developers.facebook.com/docs/whatsapp/embedded-signup/custom-flows/onboarding-business-app-users/) for availability.
:::

# Connect WhatsApp Business Cloud and Make&#x20;

To get started, you must first create a connection between WhatsApp Business Cloud and Make, allowing the two services to communicate.

To create a connection, you must do the following:

::::WorkflowBlock
:::WorkflowBlockItem
[Create a business portfolio in Meta Business Suite](docId\:CEn9RG4bEz8H-q1r10ayy)
:::

:::WorkflowBlockItem
[Create a WhatsApp Business account](docId\:CEn9RG4bEz8H-q1r10ayy)&#x20;
:::

:::WorkflowBlockItem
[Create the connection in Make](docId\:CEn9RG4bEz8H-q1r10ayy)
:::
::::

:::::ExpandableHeading
## Create a business portfolio in Meta Business Suite

Before you begin, you must create a business portfolio to manage your organization’s business assets – such as your Facebook, Instagram, and ad accounts into Meta Business Suite.

::::WorkflowBlock
:::WorkflowBlockItem
Log in to [business.facebook.com](https://business.facebook.com/) using your Facebook profile or managed Meta account.
:::

:::WorkflowBlockItem
In the top left side, click **Home**.
:::

:::WorkflowBlockItem
Click **Create a business portfolio**.
:::

:::WorkflowBlockItem
In th&#x65;**&#x20;Business portfolio** name, enter a name for the business portfolio.
:::

:::WorkflowBlockItem
Enter your contact information and other missing details.
:::

:::WorkflowBlockItem
Clic&#x6B;**&#x20;Create**.
:::

:::WorkflowBlockItem
You will receive an email to confirm your email address for your business portfolio. Click **Confirm now**.
:::
::::
:::::

::::::ExpandableHeading
## Create a WhatsApp Business account

To create a WhatsApp Business account, you can either create the account in Meta Business Suite or create it while creating a connection in Make. Ensure that your number is registered on WhatsApp business. For more information, see [How to register for the WhatsApp Business app](https://faq.whatsapp.com/1344487902959714) page.

To create the WhatsApp Business account on Meta Business Suite:

:::::WorkflowBlock
:::WorkflowBlockItem
If you have not done so yet, log in to [business.facebook.com](https://business.facebook.com/) using your Facebook profile or managed Meta account.
:::

:::WorkflowBlockItem
In the left sidebar, click **WhatsApp accounts**.
:::

:::WorkflowBlockItem
Click **+Add**.
:::

:::WorkflowBlockItem
From the **Category,&#x20;**&#x73;elect the category.
:::

::::WorkflowBlockItem
Click **Continue**.

:::hint{type="info"}
If you see an error stating "You can't complete the setup process because your business has not met the WhatsApp's policy requirements yet. Please update your business information to include your contact information and try again. Update business information", please see [Cant complete registration](https://faq.whatsapp.com/1120385166078156) page.
:::
::::

:::WorkflowBlockItem
In the **Phone number** pop up, select **Use a display name only** or **Add a new number** and use your registered WhatsApp Business number.
:::

:::WorkflowBlockItem
Follow the on-screen instructions to complete the set up.&#x20;
:::
:::::

Before you can send messages, Meta will need to review your business and display name. This can take up to 1 business day. During reviews, you can send 5 business-initiated test messages every 24 hours. You will receive an email once your review is completed. Learn more about [Business verification here](https://www.facebook.com/business/help/1095661473946872?id=180505742745347).
::::::

::::::ExpandableHeading
## Create the connection in Make

Once you create a business portfolio in Meta Business Suite and WhatsApp Business account, you can create a connection in Make.

Make provides two ways to create a connection:

1. [WhatsApp Business Cloud](docId\:CEn9RG4bEz8H-q1r10ayy)
2. [WhatsApp Business Cloud (legacy)](docId\:CEn9RG4bEz8H-q1r10ayy): Requires Permanent Token and WhatsApp Business Account ID

### Connection type: WhatsApp Business Cloud

To create the connection in Make:

:::::WorkflowBlock
::::WorkflowBlockItem
Log in to your Make account, add a WhatsApp Business Cloud module to your scenario, and click **Create a connection**.

:::hint{type="info"}
If you add a module with an ​instant​ tag, click ​**Create a webhook**​​, then ​**Create a connection**​​.
:::
::::

:::WorkflowBlockItem
In the **Connection type** field, select **WhatsApp Business Cloud**.
:::

:::WorkflowBlockItem
In the **Signup Mode** field, select how you want to connect your WhatsApp Business Account (WABA):

1. **Regular (recommended)**: Select an existing WhatsApp Business Account (WABA) or create a new one. Best for most users.
2. **Coexistence**: Connect your WhatsApp Business App phone number. Keeps the phone app active alongside Cloud API, but does not surface existing WABAs. Choose this only if you actively use the WhatsApp Business mobile app.
:::

:::WorkflowBlockItem
Optional: In the ​​**Connection name​​** field, enter a name for the connection.
:::

:::WorkflowBlockItem
Click **Save**.
:::

:::WorkflowBlockItem
Click **Continue**.
:::

:::WorkflowBlockItem
In the **Business portfolio** dropdown, select your business portfolio.
:::

:::WorkflowBlockItem
In the **WhatsApp Business account dropdown,&#x20;**&#x73;elect one of the following:&#x20;

1. Create a new WhatsApp Business account — use this option if you want to [create a new WhatsApp Business account](docId\:CEn9RG4bEz8H-q1r10ayy).
2. Pick an existing WhatsApp Business account from the list.
3. (**Coexistence**) Connect a WhatsApp Business App — use this option if you already have a verified WhatsApp Business number.

If you encounter an error, see the [Troubleshooting](docId\:CEn9RG4bEz8H-q1r10ayy) topics below.
:::

::::WorkflowBlockItem
Click **Next > Confirm > Finish**.

:::hint{type="warning"}
If you receive the **Resource not found error&#x20;**&#x6D;essage after completing the  process, please retry.

Any new Facebook Business Accounts or WhatsApp Business Accounts you created during your first attempt have been successfully created. When you retry, simply select these existing accounts from the list. It is not necessary to create them again.
:::
::::
:::::

You've successfully created the connection and can now use the WhatsApp Business Cloud app in your scenarios. If you want to make changes to your connection in the future, follow the steps [here](https://help.make.com/connect-an-application#tN2pJ).

:::::ExpandableHeading
### Connection type: WhatsApp Business Cloud (legacy)

:::hint{type="warning"}
This connection is supported only until **April 2027**.
:::

:::hint{type="warning"}
Our new connection process for WhatsApp Business Cloud integration is now available. This major update simplifies setup by **removing the requirement to create your own Facebook Developer account**. The streamlined workflow also eliminates the need to switch between platforms for manual configurations like generating access tokens, retrieving account ID, or setting up webhooks, as these tasks are now fully automated.
:::

To create a legacy connection, you need:

- A [Facebook Developer](https://developers.facebook.com/) account
- A valid mobile phone number

To connect WhatsApp Cloud API to Make involves the following steps:

1. [Set Up WhatsApp Cloud API](docId\:zKgXPvewMioQhj7S9AAfG)
2. [Create Permanent Access Token](docId\:zKgXPvewMioQhj7S9AAfG)
3. [Connect WhatsApp Business Cloud to Make](docId\:zKgXPvewMioQhj7S9AAfG)

::embed[[Youtube Link Here](https://www.youtube.com/embed/bIzL5SPEg4A)]{url="https://www.youtube.com/embed/bIzL5SPEg4A"}

**Set Up WhatsApp Cloud API**

To set up WhatsApp Cloud API:

::::WorkflowBlock
:::WorkflowBlockItem
Log in to your Facebook account.
:::

:::WorkflowBlockItem
Go to the [Facebook Developer Site](https://developers.facebook.com/), click **My Apps > Create App**.
:::

:::WorkflowBlockItem
Select **Business** as the app type. Click **Next**.
:::

:::WorkflowBlockItem
Enter the display name and select the business account. Click **Create app**.
:::

:::WorkflowBlockItem
When prompted, re-enter the password of your Facebook account. Click **Submit**.
:::

:::WorkflowBlockItem
The app is created.
:::

:::WorkflowBlockItem
On the app's Dashboard, scroll down to find the WhatsApp app, and click **Set up**.
:::

:::WorkflowBlockItem
Select the account type, and click **Continue**.
:::

:::WorkflowBlockItem
Copy the **WhatsApp Business Account ID** to a safe place.
:::
::::

**Create Permanent Access Token**

To create a permanent access token for your WhatsApp Business Cloud account:

::::WorkflowBlock
:::WorkflowBlockItem
Log in to your [Facebook Developer Account](https://developers.facebook.com/).
:::

:::WorkflowBlockItem
Click **Apps Dashboard > Business Settings**.
:::

:::WorkflowBlockItem
Go to **System Users > Add**. Enter the username, select the role as **Admin** and clic&#x6B;**&#x20;Create System User**.
:::

:::WorkflowBlockItem
Go to **Add Assets > Apps**. Select the app you want to assign to the user, enable **Full Control** access, and click **Save Changes**.
:::

:::WorkflowBlockItem
Go to **WhatsApp Accounts > Add People > Select the system user > Enable Full Control Access > Assign**.
:::

:::WorkflowBlockItem
Go to **System Users > Select the user > Generate Access Token**.
:::

:::WorkflowBlockItem
Select the app, following permissions, and then click **Generate Token**.
:::

:::WorkflowBlockItem
Copy the token to a safe place.
:::
::::

You can use this token as a permanent access token.

**Add your own phone number to WhatsApp Business Cloud API**

When you set up WhatsApp API, a test number is created for you. You can add your own number.

::::WorkflowBlock
:::WorkflowBlockItem
Log in to your Facebook developer account.
:::

:::WorkflowBlockItem
On the Getting Started page, click **Add phone number**.
:::

:::WorkflowBlockItem
Enter your business profile details and click **Next**.
:::

:::WorkflowBlockItem
Enter the business phone number that you want to connect to WhatsApp Business API.
:::

:::WorkflowBlockItem
Enter the verification code received on your phone number.
:::

:::WorkflowBlockItem
Enter your business details and click **Save**.
:::
::::

You have successfully added your own business phone number to WhatsApp Business Cloud API.

::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/b6hNMENhmj3X9B_Ng9LDF_uuid-3d433b53-fe94-3fac-1a8b-7527023d128d.png" size="80" width="851" height="451" position="center" darkWidth="851" darkHeight="451" showCaption="false"}

**Connect WhatsApp Business Cloud to Make**

To connect WhatsApp Business Cloud with Make you need to obtain the [Permanent Token](docId\:zKgXPvewMioQhj7S9AAfG) and WhatsApp Business Account ID values from your WhatsApp Business Cloud account.

::::WorkflowBlock
:::WorkflowBlockItem
Log in to your Make account, and add a module from the WhatsApp Business Cloud app into a Make scenario.
:::

:::WorkflowBlockItem
Click **Add** next to the **Connection** field.
:::

:::WorkflowBlockItem
In the **Connection name** field, enter a name for the connection.
:::

:::WorkflowBlockItem
In the **Permanent Token** field, enter the [token](docId\:zKgXPvewMioQhj7S9AAfG) created prior to the connection.

You can also use a temporary token which is only valid for 24 hours and available on the getting started screen.
:::

:::WorkflowBlockItem
In the **WhatsApp Business Account ID** field, enter the ID from your **Facebook Developer account > WhatsApp > Getting Started** section screen, and click **Save**.
:::
::::

You have successfully connected the WhatsApp Business Cloud app and can now build Make.
:::::
::::::

# Set up a WhatsApp Business Cloud webhook

The WhatsApp Business Cloud app has `instant` modules—webhooks that watch for certain changes in WhatsApp Business Cloud and immediately start your scenario when those changes happen. To use these modules, you must set up the webhook in your WhatsApp Business Cloud account.

To set up the webhook:

::::WorkflowBlock
:::WorkflowBlockItem
Add a WhatsApp Business Cloud `instant`​ module to your scenario and click **Create a webhook​**​.
:::

:::WorkflowBlockItem
Optional: Enter a name for the webhook in the ​**Webhook name​​** field.
:::

:::WorkflowBlockItem
In the ​**Connection**​​ field, select a connection for the webhook.&#x20;

If you haven't created a WhatsApp Business Cloud connection yet, refer to the [Connect WhatsApp Business Cloud and Make](docId\:CEn9RG4bEz8H-q1r10ayy) section above.
:::

:::WorkflowBlockItem
In the **Events** field, select the events you want to monitor. You can uncheck to receive all types of events.
:::

:::WorkflowBlockItem
Click ​**Save**​.
:::
::::

Your webhook is now set up. When the selected change occurs in WhatsApp Business Cloud, Make will immediately be notified and start your scenario.

:::hint{type="info"}
For more detailed information about modules, refer to the [Whatsapp Business Cloud modules](docId\:RBzoJw76Wjixkkq3dxy5H) page.
:::

# Templates

You can look for WhatsApp Business Cloud templates in [Make's template gallery](https://www.make.com/en/templates), where you'll find thousands of pre-created scenarios.