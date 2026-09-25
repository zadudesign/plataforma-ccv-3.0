---
title: Google Sheets
slug: google-sheets
image: https://make-cxp-documentation.ams3.digitaloceanspaces.com/apps-center-icons/PREVIEW_google-sheets.png
docTags: 
createdAt: 2025-02-03T13:29:10.708Z
---

::::VerticalSplit{layout="left"}
:::VerticalSplitItem
::Image[]{src="https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/5NRhEo7O6dh6IEPIx66xl-20251029-172052.png" size="50" width="800" height="800" position="center" darkWidth="800" darkHeight="800" showCaption="false"}
:::

:::VerticalSplitItem
Google Sheets is a spreadsheet application. With the Google Sheets app in Make, you can manage the spreadsheets, rows, and cells in your Google Sheets account.
:::
::::

# Requirements

To use the Google Sheets app in Make, you must have a [Google account](https://accounts.google.com).

:::hint{type="info"}
Make's use and transfer of information received from Google APIs to any other app will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy).
:::

# Connect Google Sheets and Make&#x20;

To create the connection:

:::::WorkflowBlock
::::WorkflowBlockItem
Log in to your Make account, add a Google Sheets module to your scenario, and click **Create a connection**.

:::hint{type="info"}
If you add a module with an ​instant​ tag, click ​**Create a webhook**​​, then ​**Create a connection**​​.
:::
::::

:::WorkflowBlockItem
Optional: In the **Connection name** field, enter a name for the connection.
:::

:::WorkflowBlockItem
Optional: Switch on the **Show advanced settings** toggle and enter your Google Cloud Platform project client credentials. For more information, see the [Create and configure a Google Cloud Platform project for Google Sheets](docId\:Bfky9RO9lWvqnMVDj1TCL) section.
:::

:::WorkflowBlockItem
Click **Sign in with Google**.
:::

:::WorkflowBlockItem
If prompted, authenticate your account, grant all requested permissions, and confirm access.
:::
:::::

You've successfully created the connection and can now use the Google Sheets app in your scenarios. If you want to make changes to your connection in the future, follow the steps [here](https://help.make.com/connect-an-application#tN2pJ).

:::::ExpandableHeading
## Set up a Google Sheets webhook&#x20;

You can set up the webhooks for the **Perform a Function&#x20;**&#x61;nd **Watch Changes&#x20;**`instant` modules with the [Make Google Sheets Add-on](https://workspace.google.com/marketplace/app/make/947306521495?flow_type=2) or using a specific script in Google Sheets.

### Set up a Google Sheets webhook with the Make add-on

To set up the webhooks for the **Perform a Function&#x20;**&#x61;nd **Watch Changes&#x20;**`instant` modules with the **Make Google Sheets Add-on**:

::::WorkflowBlock
:::WorkflowBlockItem
Log in to your Make account, add either the **Perform a Function** or **Watch Changes** module to your scenario, and click **Create a webhook** or **Add**.
:::

:::WorkflowBlockItem
Optional: Enter a name for the webhook in the **Webhook name** field.
:::

:::WorkflowBlockItem
Click **Save**.
:::

:::WorkflowBlockItem
Open Google Sheets and the spreadsheet where you want to add the webhook.&#x20;
:::

:::WorkflowBlockItem
Go t&#x6F;**&#x20;Extensions > Add-ons > Get add-ons.**

![](https://archbee-image-uploads.s3.amazonaws.com/PL8X94efBsjvhfQV3wyyj-i9Ed73etcnSZ58Z9GNTM0-20250731-133243.png)
:::

:::WorkflowBlockItem
Search for the Make add-on, and click **Install**.

![](https://archbee-image-uploads.s3.amazonaws.com/PL8X94efBsjvhfQV3wyyj-bEaNd_3P1Ral8kscwXBIU-20250731-133358.png)
:::

:::WorkflowBlockItem
You'll be prompted to authenticate your account and confirm access.
:::

:::WorkflowBlockItem
The Make add-on should now be added to your spreadsheet.
:::

:::WorkflowBlockItem
&#x20;Go to&#x20;**&#x20;Extensions > Make > Settings.**

![](https://archbee-image-uploads.s3.amazonaws.com/PL8X94efBsjvhfQV3wyyj-5O64Zm3_G4pOpQDx3aFgd-20250731-133711.png)
:::

:::WorkflowBlockItem
In the **Settings** window, you can paste the webhook URL you copied from the **Watch Changes** and/or **Perform a Function&#x20;**&#x6D;odules in Make. You can also select a **Sheet** and a **Range** to watch for changes.

::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/PL8X94efBsjvhfQV3wyyj-Ytzo9v9pCZM3a8GEW1-6I-20250801-084205.png" size="50" width="464" height="1270" position="center" darkWidth="464" darkHeight="1270" showCaption="false"}

Once you've configured the settings, click **Save**.
:::
::::

The **Perform a Function** or **Watch Changes** module will now send data through the webhook when the selected event occurs.

### Set up a Google Sheets webhook with a script

To set up the webhooks for the **Perform a Function&#x20;**&#x61;nd **Watch Changes&#x20;**`instant` modules **using a script**, watch the [video tutorial](https://www.loom.com/share/3fb30a3116864a4d9175ce2395af2a72?sid=199af208-30ee-4ee1-80ec-064ba0314f7e) that explains the step-by step process, or follow the steps below. Click [here](https://cdn.make.com/files/g-sheet-addon/Google-sheet_add-on.txt?_gl=1*18shep*_gcl_au*MjI2NzQ4NDY4LjE3MzY0MjY2OTg.*_ga*MTk1MzM2MjQ5LjE3MDQ4NzY0MzM.*_ga_MY0CJTCDSF*MTc0MTc4MTk0OC40ODYuMS4xNzQxNzg0NDcwLjYwLjAuMA..) to access the script used in the tutorial.

::loom{url="https://www.loom.com/embed/3fb30a3116864a4d9175ce2395af2a72?sid=199af208-30ee-4ee1-80ec-064ba0314f7e" aspectRatio="1.7777777777777777"}

::::WorkflowBlock
:::WorkflowBlockItem
Log in to your Make account, add either the **Perform a Function** or **Watch Changes** module to your scenario, and click **Create a webhook** or **Add**.
:::

:::WorkflowBlockItem
Optional: Enter a name for the webhook in the **Webhook name** field.
:::

:::WorkflowBlockItem
Click **Save**.
:::

:::WorkflowBlockItem
Next you will paste a script into your spreadsheet. Click [here](https://cdn.make.com/files/g-sheet-addon/Google-sheet_add-on.txt?_gl=1*18shep*_gcl_au*MjI2NzQ4NDY4LjE3MzY0MjY2OTg.*_ga*MTk1MzM2MjQ5LjE3MDQ4NzY0MzM.*_ga_MY0CJTCDSF*MTc0MTc4MTk0OC40ODYuMS4xNzQxNzg0NDcwLjYwLjAuMA..) to access the script and copy the entire content.
:::

:::WorkflowBlockItem
Open the spreadsheet and go t&#x6F;**&#x20;Extensions > Apps Script**. You will see a new project containing default content.
:::

:::WorkflowBlockItem
Delete the default content and paste the script you copied in Step 4. This script must be updated with the webhook address from your Google Sheets module.
:::

:::WorkflowBlockItem
To obtain the webhook address, go back to your scenario, click on the module, and click **Copy address to clipboard**.
:::

:::WorkflowBlockItem
Now return to the Apps Script project in your spreadsheet. At the beginning of the script, you will see the lines `WATCH_CHANGE_WEBHOOK_URL = 'https://hook.eu1.make.com/xxx';` and `PERFORM_FUNCTION_WEBHOOK_URL = 'https://hook.eu1.make.com/xxx';`.
:::

:::WorkflowBlockItem
Depending on the module you are using, replace `https://hook.eu1.make.com/xxx` with the webhook address you copied in Step 7.

It is important to paste the full webhook address into the script to avoid any errors.
:::

:::WorkflowBlockItem
Click the **Save** icon.
:::

:::WorkflowBlockItem
In the left sidebar, click the **Triggers** icon.
:::

:::WorkflowBlockItem
Click **Add Trigger**.
:::

:::WorkflowBlockItem
In the **Select event type** field, select **On edit**, and click **Save**.
:::

:::WorkflowBlockItem
If prompted, authenticate your account and confirm access.
:::
::::

The **Perform a Function** or **Watch Changes** module will now send data through the webhook when the selected event occurs.
:::::

:::::ExpandableHeading
## Create and configure a Google Cloud Platform project for Google Sheets

To connect to Make using your own client credentials, you can create and configure a project in the Google Cloud Platform.

### Create a Google Cloud Platform project for Google Sheets

To create a Google Cloud Platform project:

::::WorkflowBlock
:::WorkflowBlockItem
Log in to the [Google Cloud Platform](https://console.cloud.google.com/) using your Google credentials.
:::

:::WorkflowBlockItem
On the welcome page, click **Create or select a project** > **New project**. If you already have a project, proceed to the step 5.

::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/yAufeXqD1oGWOPBNi5MAm-Oa9SL8PSb5oLdpaYe6goL-20250312-113144.png" size="70" width="626" height="189" position="flex-start" alt="Google Cloud Platform" darkWidth="626" darkHeight="189" showCaption="false"}
:::

:::WorkflowBlockItem
Enter a **Project name** and select the **Location** for your project.
:::

:::WorkflowBlockItem
Click **Create**.

![Select a project](https://archbee-image-uploads.s3.amazonaws.com/yAufeXqD1oGWOPBNi5MAm-I7LwD3Eqxo8A1xGdNU00F-20250312-113236.png)
:::

:::WorkflowBlockItem
In the top menu, check if your new project is selected in the **Select a project** dropdown. If not, select the project you just created.
:::
::::

:::hint{type="info"}
To create a new project or work in the existing one, you need to have the `serviceusage.services.enable` permission. If you don’t have this permission, ask the Google Cloud Platform Project Owner or Project IAM Admin to grant it to you.
:::



### Enable APIS for Google Sheets

To enable the required APIs:

::::WorkflowBlock
:::WorkflowBlockItem
Open the left navigation menu and go to **APIs & Services** > **Library**.
:::

:::WorkflowBlockItem
Search for the following API: **Google Sheets API** and **Google Drive API**.

![Google APIs](https://archbee-image-uploads.s3.amazonaws.com/yAufeXqD1oGWOPBNi5MAm-REmWXs0paliNZ3UaoQFUy-20250312-113349.png)
:::

:::WorkflowBlockItem
Click **Gmail API**, then click **Enable**. If you see the **Manage** button instead of the **Enable** button, you can proceed to the next step: the API is already enabled.
:::
::::

### Configure your OAuth consent screen for Google Sheets

To configure your OAuth consent screen:

::::WorkflowBlock
:::WorkflowBlockItem
In the left sidebar, click **Google Auth Platform**.

If you don't see **Google Auth Platform i**n the left sidebar, click **View all products&#x20;**&#x61;t the top of it, then pin **Google Auth Platform&#x20;**&#x74;o the sidebar.

![Google Auth Platform](https://archbee-image-uploads.s3.amazonaws.com/yAufeXqD1oGWOPBNi5MAm-PtY3LfOgrLoKJ90OuxeAs-20250312-113600.png)
:::

:::WorkflowBlockItem
Click **Get Started**.
:::

:::WorkflowBlockItem
In the **Overview** section, under **App information**, enter *Make* as the app name and provide your Gmail address. Click **Next**.
:::

:::WorkflowBlockItem
Under **Audience**, select **External**. Click **Next**.

For more information regarding user types, refer to [Google's Exceptions to verification requirements documentation](https://support.google.com/cloud/answer/9110914#exceptions-ver-reqts).
:::

:::WorkflowBlockItem
Under **Contact Information**, enter your Gmail address and click **Next**.
:::

:::WorkflowBlockItem
Under **Finish**, agree to the Google User Data Policy.
:::

:::WorkflowBlockItem
Click **Continue** > **Create**.
:::

:::WorkflowBlockItem
Click **Create OAuth Client**.

![Create OAuth client](https://archbee-image-uploads.s3.amazonaws.com/yAufeXqD1oGWOPBNi5MAm-pmJoicQVYOCcrygT-qn4X-20250312-113750.png)
:::

:::WorkflowBlockItem
In the **Branding** section, under **Authorized domains**, add `make.com` and `integromat.com`. Click **Save.**
:::

:::WorkflowBlockItem
Optional: In the **Audience** section, add your Gmail address on the **Test users** page, then click **Save and continue** if you want the project to remain in the **Testing** publishing status. Read the note below to learn more about the publishing status.
:::

:::WorkflowBlockItem
In the **Data Access** section, click **Add or remove scopes**, add the following scopes:

`https://www.googleapis.com/auth/spreadsheets`

`https://www.googleapis.com/auth/drive`

You can add scopes using:

- A table with filters
- A window to manually enter scopes:

Click **Update**.
:::

:::WorkflowBlockItem
Click **Save**.
:::
::::

:::hint{type="info"}
**Publishing Status**

**Testing:** If you keep your project in the **Testing** status, you will be required to reauthorize your connection in Make every week. To avoid weekly reauthorization, update the project status to **In production**.

**In production:** If you update your project to the **In production** status, you will not be required to reauthorize the connection weekly. To update your project's status, go to the **Google Auth Platform**, the **Audience** section, and click **Publish app**. If you see the notice **Needs verification**, you can choose whether to go through the [Google verification process](https://support.google.com/cloud/answer/13463073?authuser=1\&visit_id=638718595933013017-1855034908\&rd=1) for the app or to connect to your unverified app. Currently connecting to unverified apps works in Make, but we cannot guarantee the Google will allow connections to unverified apps for an indefinite period.

For more information regarding the publishing status, refer to the Publishing status section of [Google's Setting up your OAuth consent screen help](https://support.google.com/cloud/answer/10311615#zippy=).
:::

### Create your Google Sheets client credentials

To create your client credentials:

::::WorkflowBlock
:::WorkflowBlockItem
In Google Auth Platform, click **Clients**.
:::

:::WorkflowBlockItem
Click **+ Create Client**.

![Create Client](https://archbee-image-uploads.s3.amazonaws.com/yAufeXqD1oGWOPBNi5MAm-_ZOZfMOLZTl5cfqsnn9Zk-20250312-114156.png)
:::

:::WorkflowBlockItem
In the **Application type** dropdown, select **Web application**.
:::

:::WorkflowBlockItem
Update the **Name** of your OAuth client. This will help you identify it in the platform.
:::

:::WorkflowBlockItem
In the **Authorized redirect URIs** section, click **+ Add URI** and enter the following redirect URI:

`https://www.integromat.com/oauth/cb/google/`

![Add the Redirect URI](https://archbee-image-uploads.s3.amazonaws.com/yAufeXqD1oGWOPBNi5MAm-dJYD9MWaywcdRx9-cI1gO-20250416-055520.png)
:::

:::WorkflowBlockItem
Click **Create**.
:::

:::WorkflowBlockItem
Click the OAuth 2.0 Client you created, copy your **Client ID** and **Client secret** values, and store them in a safe place.
:::
::::

You will use these values in the **Client ID** and **Client Secret** fields in Make.
:::::

# Templates

You can look for Google Sheets templates in [Make's template gallery](https://www.make.com/en/templates), where you'll find thousands of pre-created scenarios.

# Google Sheets resources

- [Google Sheets API documentation](https://developers.google.com/workspace/sheets/api/guides/concepts)
