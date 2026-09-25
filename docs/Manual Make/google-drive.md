---
title: Google Drive
slug: google-drive
image: https://make-cxp-documentation.ams3.digitaloceanspaces.com/apps-center-icons/PREVIEW_google-drive.png
docTags: 
createdAt: 2025-02-03T13:28:47.489Z
---

::::VerticalSplit{layout="left"}
:::VerticalSplitItem
::Image[]{src="https://app.archbee.com/api/optimize/yAufeXqD1oGWOPBNi5MAm-ZX5izabirJrJ3QQZvVwSk-20250313-105949.png" size="50" width="113" height="113" position="center" darkWidth="113" darkHeight="113" showCaption="false"}
:::

:::VerticalSplitItem
Google Drive is a cloud-based storage platform. With the Google Drive app in Make, you can manage your files, folders, or shared drives in your Google Drive account.
:::
::::

# Requirements

To use the Google Drive app in Make, you must have a [Google account](https://accounts.google.com).

:::hint{type="info"}
Make's use and transfer of information received from Google APIs to any other app will adhere to [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy).
:::

# Connect Google Drive and Make&#x20;

:::hint{type="info"}
To connect an email ending in `@gmail` or `@googlemail`, you need to [create a custom OAuth client](docId\:CT1o6eSjM1F0Xm3Wk5nBx) in the Google Cloud Platform and get your project client credentials to establish the connection in Make.
:::

To create the connection:

:::::WorkflowBlock
::::WorkflowBlockItem
Log in to your Make account, add a Google Drive module to your scenario, and click **Create a connection**.

:::hint{type="info"}
If you add a module with an ​instant​ tag, click ​**Create a webhook**​​, then ​**Create a connection**​​.
:::
::::

:::WorkflowBlockItem
Optional: In the **Connection name** field, enter a name for the connection.
:::

:::WorkflowBlockItem
Optional for Google Drive users with non-`@gmail` or `@googlemail` domains: Switch on the **Advanced settings** toggle and enter your Google Cloud Platform project client credentials. For more information, see the [Create and configure a Google Cloud Platform project for Google Drive](https://apps.make.com/google-drive#KA5rq) section.
:::

:::WorkflowBlockItem
Click **Sign in with Google**.
:::

:::WorkflowBlockItem
If prompted, authenticate your account, grant all requested permissions, and confirm access.
:::
:::::

You've successfully created the connection and can now use the Google Drive app in your scenarios. If you want to make changes to your connection in the future, follow the steps [here](https://help.make.com/connect-an-application#tN2pJ).

:::hint{type="info"}
For `@gmail` users: Your connection needs to be reauthorized every six months. If you don’t reauthorize, your connection will stop working and your scenarios will fail.
:::

::::::ExpandableHeading
## Create and configure a Google Cloud Platform project for Google Drive

To connect to Make using your own client credentials, you can create and configure a project in the Google Cloud Platform.

### Create a Google Cloud Platform project for Google Drive

To create a Google Cloud Platform project:

::::WorkflowBlock
:::WorkflowBlockItem
Log in to the [Google Cloud Platform](https://console.cloud.google.com/) using your Google credentials.
:::

:::WorkflowBlockItem
On the welcome page, click **Create or select a project** > **New project**. If you already have a project, proceed to the [step 5](#).

::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/yAufeXqD1oGWOPBNi5MAm-Oa9SL8PSb5oLdpaYe6goL-20250312-113144.png" size="70" width="626" height="189" position="flex-start" alt="Google Cloud Platofrm" darkWidth="626" darkHeight="189" showCaption="false"}
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

### Enable APIs for Google Drive

To enable the required APIs:

::::WorkflowBlock
:::WorkflowBlockItem
Open the left navigation menu and go to **APIs & Services** > **Library**.
:::

:::WorkflowBlockItem
Search for the following API: **Google Drive API**.
:::

:::WorkflowBlockItem
Click **Google Drive API**, then click **Enable**. If you see the **Manage** button instead of the **Enable** button, you can proceed to the next step: the API is already enabled.
:::
::::

### Configure your OAuth consent screen for Google Drive

To configure your OAuth consent screen:

:::::WorkflowBlock
:::WorkflowBlockItem
In the left sidebar of the Google Cloud Platform, click **APIs & Services** > **OAuth consent screen**.

::Image[]{src="https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/szrwOEJWw7Ei-b7MSgGJt-20250912-111324.png" size="40" width="730" height="1298" position="center" darkWidth="730" darkHeight="1298" showCaption="false"}
:::

:::WorkflowBlockItem
Click **Get Started**.
:::

:::WorkflowBlockItem
In the **Overview** section:

- Under **App information**, enter *Make* as the app name, enter your Gmail address, and click **Next**.

::Image[]{src="https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/iFvukbKbVakiQPqmsvre8-20250912-112021.png" size="70" width="870" height="972" position="center" darkWidth="870" darkHeight="972" showCaption="false" indent="4"}

- Under **Audience**, select **External**, and click **Next**. For more information regarding user types, refer to [Google's Exceptions to verification requirements documentation](https://support.google.com/cloud/answer/9110914#exceptions-ver-reqts).
- Under **Contact Information**, enter your Gmail address, and click **Next**.
- Under **Finish**, agree to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy?authuser=1), and click **Continue**, then **Create**.
- In the next window, click **Create OAuth Client**.

::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/gWhkTq2f_h5To-n_byZ7b-20250912-114156.png" size="100" width="2764" height="338" position="center" darkWidth="2764" darkHeight="338" showCaption="false" indent="4"}

- You'll be redirected to the **Clients** tab. You can skip it for now or refer to the [Create your client credentials](https://apps.make.com/create-and-configure-a-google-cloud-platform-project-for-gmail#jOv_g) section to configure it.&#x20;
:::

:::WorkflowBlockItem
In the **Branding** section:&#x20;

- Under **Authorized domains,&#x20;**&#x63;lick **+Add domain.**
- Add `make.com` and `integromat.com`.&#x20;
- Click **Save**.

::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/qyTTXd-f6d-L3Qpue7jgY-20250912-115053.png" size="100" width="1264" height="1286" position="center" darkWidth="1264" darkHeight="1286" showCaption="false" indent="4"}
:::

::::WorkflowBlockItem
Optional: In the **Audience** section, add your Gmail address on the **Test users** page, then click **Save and continue** if you want the project to remain in the **Testing** publishing status. Read the note below to learn more about the publishing status.

::Image[]{src="https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/eMmPIQOVjUMtu2KFMZISU-20250912-115725.png" size="66" width="1272" height="1198" position="center" darkWidth="1272" darkHeight="1198" showCaption="false"}

:::hint{type="info"}
**Publishing Status**

**Testing:** If you keep your project in the **Testing** status, you will be required to reauthorize your connection in Make every week. To avoid weekly reauthorization, update the project status to **In production**.

**In production:** If you update your project to the **In production** status, you will not be required to reauthorize the connection weekly. To update your project's status, go to the **Google Auth Platform**, the **Audience** section, and click **Publish app**. If you see the notice **Needs verification**, you can choose whether to go through the [Google verification process](https://support.google.com/cloud/answer/13463073?authuser=1\&visit_id=638718595933013017-1855034908\&rd=1) for the app or to connect to your unverified app. Currently connecting to unverified apps works in Make, but we cannot guarantee the Google will allow connections to unverified apps for an indefinite period.

For more information regarding the publishing status, refer to the Publishing status section of [Google's Setting up your OAuth consent screen help](https://support.google.com/cloud/answer/10311615#zippy=).
:::
::::

:::WorkflowBlockItem
In the **Data Access** section, click **Add or remove scopes**, add the following scopes:

- `https://www.googleapis.com/auth/drive`&#x20;
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/drive.readonly`

You can add scopes using:

- A table with filters
- A window to manually enter scopes:

Click **Update**.
:::

:::WorkflowBlockItem
Click **Save**.
:::
:::::

### Create your Google Drive client credentials

To create your client credentials:

::::WorkflowBlock
:::WorkflowBlockItem
In the left sidebar of the Google Cloud Platform, click **APIs & Services** > **OAuth consent screen**.
:::

:::WorkflowBlockItem
Go to the **Clients&#x20;**&#x73;ection, and click **+Create client**.

::Image[]{src="https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/-1bUMR6Uj2xMDxANLbnHN-20250912-123323.png" size="40" width="830" height="402" position="center" darkWidth="830" darkHeight="402" showCaption="false"}
:::

:::WorkflowBlockItem
Under **Create OAuth client ID**:&#x20;

- In the **Application type** dropdown, select **Web application**.
- In the **Name** field, update the name of your OAuth client. This will help you identify it in the console afterward.
:::

:::WorkflowBlockItem
Under the **Authorized redirect URIs,&#x20;**&#x63;lick **+ Add URI** and enter the required redirect URI:

`https://www.integromat.com/oauth/cb/google-restricted`

::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/Chg-2_QAkRaYj-LuTCS2b-20260310-102844.png" size="70" width="1062" height="1228" position="center" darkWidth="1062" darkHeight="1228" showCaption="false"}
:::

:::WorkflowBlockItem
Click **Create**.
:::

:::WorkflowBlockItem
Click the OAuth 2.0 Client you created, copy your **Client ID** and **Client secret** values, and store them in a safe place.

::Image[]{src="https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/135fn3lo77U0-m4yutV1M-20250915-080241.png" size="40" width="810" height="1044" position="center" darkWidth="810" darkHeight="1044" showCaption="false"}
:::
::::

You will use these values in the **Client ID** and **Client Secret** fields when you enable  **Advanced** **settings** in the **Create a connection** window in Make.

::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/fs6dKKSAKB6tqBSmkgluE-20260310-100843.png" size="40" width="696" height="1076" position="center" darkWidth="696" darkHeight="1076" showCaption="false"}
::::::

# Templates

You can look for Google Drive templates in [Make's template gallery](https://www.make.com/en/templates), where you'll find thousands of pre-created scenarios.

# Google Drive resources

- [Google Drive API documentation](https://developers.google.com/drive/api/guides/about-sdk)
