---
title: Google Drive modules
slug: google-drive-modules
image: https://make-cxp-documentation.ams3.cdn.digitaloceanspaces.com/apps-center-icons/PREVIEW_DEFAULT.png
docTags: 
createdAt: 2025-03-13T11:18:43.778Z
---

After connecting to the Google Drive app, you can use the following modules to build your scenarios.&#x20;

# File/Folder

:::ExpandableHeading
## Watch Files in a Folder

Triggers when a file is created or modified in a selected folder.

| **Field**                           | **Description**                                                                                                                                                                                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**                      | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                                         |
| **Watch Files**                     | Select whether you want to watch new files in the folder (By Created Time) or modified files (By Modified Time).                                                                                                                                          |
| **Choose a Drive**                  | Select whether you want to watch files in one of the following locations:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **Select the Folder to be Watched** | Navigate to the folder you want to watch.                                                                                                                                                                                                                 |
| **File Types to Watch**             | Select file type to filter watched files by.                                                                                                                                                                                                              |
| **Limit**                           | Set the maximum number of files Make will return during one execution cycle.                                                                                                                                                                              |
:::

:::ExpandableHeading
## Watch All Files

Triggers when a file is created or modified.

| **Field**               | **Description**                                                                                                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**          | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                                         |
| **Watch Files**         | Select whether you want to watch new files in the folder (By Created Time), or modified files (By Modified Time).                                                                                                                                         |
| **Choose a Drive**      | Select whether you want to watch files in one of the following locations:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **File Types to Watch** | Select file type to filter watched files by.                                                                                                                                                                                                              |
| **Limit**               | Set the maximum number of files Make will return during one execution cycle.                                                                                                                                                                              |
:::

:::ExpandableHeading
## Watch Folders

Triggers when a new folder is created or modified.

| **Field**           | **Description**                                                                                                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**      | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                                           |
| **Watch Files**     | Select whether you want to watch new folders (By Created Time), or modified folders (By Modified Time)                                                                                                                                                      |
| **Choose a Drive**  | Select whether you want to watch folders in one of the following locations:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **Choose a Folder** | Navigate to the folder you want to watch for the folders.                                                                                                                                                                                                   |
| **Limit**           | Set the maximum number of folders Make will return during one execution cycle.                                                                                                                                                                              |
:::

:::ExpandableHeading
## Search for Files/Folders

Searches for files or folders based on search criteria.

| **Field**           | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**      | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Choose a Drive**  | Select the location where you want to search for files or folders:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error)                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Search Scope**    | You can limit search scope to include files or folders within the selected folder or to search everywhere. If no folder is chosen, it defaults to the root folder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Choose a Folder** | Navigate to the folder you want to search for the files or folders.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Retrieve**        | Select whether you want to search for files, folders, or both.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Search**          | Select the type of the search you want to perform.<br />* Search within file/folder names
* Full text search
* Enter custom search query                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Query**           | Enter the query (differs based on the search type selected in the **Search** field above).<br />* Search within file/folder names: Enter a part of the file name or full file name (including the suffix) you want to search.  Select whether you want to search exact term or search the file/folder name that contains the entered term in the Search Options field below.    &#x20;
* Full text search: Enter any search term you want search in your Google Drive.   &#x20;
* Enter custom search query: Enter the custom search query.  Add the folder selected above to the query Searches for the folder n the parents collection. This finds all files and folders located directly in the folder selected above. |
| **Limit**           | Set the maximum number of files or folders Make will return during one execution cycle.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
:::

:::ExpandableHeading
## Download a File

Downloads a file from your Google Drive.

| **Field**                                                                 | **Description**                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**                                                            | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                      |
| **Choose a Drive**                                                        | Select the location where you want to download a file:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **Enter a File ID**                                                       | Select whether you want to enter (map) the file ID manually or select the file using the menu.                                                                                                                                         |
| **File ID**                                                               | Enter (map) the file ID of the file you want to download.                                                                                                                                                                              |
| **Convert Google Documents/Spreadsheets/Slides/Drawings Files to Format** | Select the file type of the file you want to download and target file type you want convert to the file to.                                                                                                                            |
:::

:::ExpandableHeading
## Create a File from Text

Creates a file from plain text.&#x20;

| **Field**                                    | **Description**                                                                                                                                                                                                                        |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**                               | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                      |
| **Choose a Drive**                           | Select the location where you want to create the file:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **New Text File Location**                   | Select the target location where you want to create the new file.                                                                                                                                                                      |
| **File Name**                                | Enter the name for the new file.                                                                                                                                                                                                       |
| **File Content**                             | Enter the plain text content of the new file.                                                                                                                                                                                          |
| **Convert the File to Google Docs Document** | Enable this to set the file's **mimeType** to **application/vnd.google-apps.document** instead of **text/plain**.                                                                                                                      |
:::

:::ExpandableHeading
## Create a Folder

Creates a folder in the specified location.

| **Field**               | **Description**                                                                                                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**          | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                        |
| **Choose a drive**      | Select the location where you want to create the folder:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **New Folder Location** | Select the target location where you want to create the new folder.                                                                                                                                                                      |
| **New Folder's Name**   | Enter the name for the new folder.                                                                                                                                                                                                       |
| **Share Folder**        | If enabled, the folder is shared to anyone with the link of the folder (Web View Link). Otherwise the Web View Link works for the owners only.                                                                                           |
| **Type**                | Select permission for the folder. A permission grants a user, group, domain, or the world access to a folder hierarchy.                                                                                                                  |
| **Role**                | Select the role to define what users can do with a file or folder. For the list of operations users can perform for each role please refer to the [Roles](https://developers.google.com/drive/api/v3/ref-roles) documentation.           |
:::

:::ExpandableHeading
## Create a File/Folder Shortcut

Creates a new file or folder shortcut.

| **Field**                   | **Description**                                                                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**              | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                              |
| **Original File's Drive**   | Select the original drive:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error)     |
| **Select File/Folder**      | Select whether you want to create a shortcut for a file or folder.                                                                                                                                             |
| **File ID/ Folder ID**      | Select the File ID (or Folder ID) of the file (or folder) whose shortcut you want to create.                                                                                                                   |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator. (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error)                        |
| **Shared Drive**            | Select the shared drive to create a file or folder shortcut. (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error)                          |
| **New Drive Location**      | Select the new drive location:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **New Folder Location**     | Select the target folder where you want to create a shortcut to the file or folder.                                                                                                                            |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator. (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error)                        |
| **Shared Drive**            | Select the shared drive to create a file or folder shortcut. (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error)                          |
| **Copied File Name**        | Enter a new name for the file or folder.<br />Leave blank if you do not want to change the original file name.                                                                                                 |
:::

:::ExpandableHeading
## Upload a File

Uploads a file to your Google Drive.

| **Field**                   | **Description**                                                                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**              | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                              |
| **Enter a Folder ID**       | Select whether you want to enter (map) the folder ID manually or select the folder using the menu.                                                                                                             |
| **Folder ID**               | Enter (map) the folder ID of the folder you want to upload the file to.                                                                                                                                        |
| **New Drive Location**      | Select the new drive location:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **New Folder Location**     | Select the target location where you want to upload a file.                                                                                                                                                    |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.                             |
| **Shared Drive**            | Select the shared drive whose file you want to upload.                                                                                                                                                         |
| **New File Name**           | Enter the new file name if you want to change the name of the file.                                                                                                                                            |
| **File**                    | Enter the file's details:<br />* File Name: Enter a name for the file including the extension, for example, `invoice.xml`.
* Data: Enter the file data manually.                                               |
| **Convert a File**          | Select whether to convert the file.                                                                                                                                                                            |
:::

:::ExpandableHeading
## Update a File

Updates a file's metadata and/or content.

| **Field**                   | **Description**                                                                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connection**              | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                    |
| **Enter a File ID**         | Select whether you want to enter (map) the file ID manually or select the file using the menu.                                                                                                                                       |
| **Choose a Drive**          | Select the location where you want to update a file:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only!&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **File ID**                 | Enter (map) the File ID of the file you want to update.                                                                                                                                                                              |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.                                                   |
| **Shared Drive**            | Select the shared drive to update a file.                                                                                                                                                                                            |
| **New Updated File Name**   | Enter the new file name if you want to change the name of the file.                                                                                                                                                                  |
| **File Description**        | Enter the new file description.                                                                                                                                                                                                      |
| **Change File Content**     | Enable this option to change the file content. The new file must have the same `mimeType` as the original file.                                                                                                                      |
| **File Name**               | File name, including the extension, e.g.`invoice.xml`                                                                                                                                                                                |
| **Data**                    | Enter (map) the data of the file you want to update.                                                                                                                                                                                 |
| **Keep Revision Forever**   | Select whether to retain the revision.<br />You can retain only 200 revisions for the file forever. If the limit is reached, you need to delete pinned revisions.                                                                    |
:::

:::ExpandableHeading
## Rename a Folder

Renames an existing folder.

| **Field**                   | **Description**                                                                                                                                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**              | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                      |
| **Enter a File ID**         | Select whether you want to enter (map) the file ID manually or select the file using the menu.                                                                                                                                         |
| **Folder ID**               | Enter the Folder ID which you want to rename.                                                                                                                                                                                          |
| **Choose a Drive**          | Select the location where you want to rename a folder:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only!&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **New Folder Location**     | Select the new location for the folder.                                                                                                                                                                                                |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.                                                     |
| **Shared Drive**            | Select the new location in the shared drive for the folder.                                                                                                                                                                            |
| **Folder Name**             | Enter a new name for the folder.                                                                                                                                                                                                       |
| **Folder Description**      | Enter a description for the folder.                                                                                                                                                                                                    |
:::

:::ExpandableHeading
## Move a File/Folder to Trash

Moves a file or folder to the trash.

| **Field**                  | **Description**                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Connection**             | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                  |
| **Enter a File/Folder ID** | Select whether you want to enter (map) the file or folder ID manually or select the file or folder using the menu. |
| **Select File/Folder**     | Select whether you want to move the file or folder to the trash.                                                   |
| **File ID / Folder ID**    | Enter (map) the File ID (or folder ID) of the file (or folder) you want to move to the trash.                      |
:::

:::ExpandableHeading
## Delete a File/Folder

Permanently deletes a file or folder. The file or folder is deleted permanently without moving it to trash.

| **Field**                  | **Description**                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Connection**             | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                  |
| **Enter a File/Folder ID** | Select whether you want to enter (map) the file or folder ID manually or select the file or folder using the menu. |
| **Select File/Folder**     | Select whether you want to permanently delete a file or folder.                                                    |
| **File ID / Folder ID**    | Enter (map) the File ID (or folder ID) of the file (or folder) you want to permanently delete.                     |
:::

:::ExpandableHeading
## Copy a File

Makes a copy of an existing file.

| **Field**                 | **Description**                                                                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**            | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                     |
| **Original File's Drive** | Select the drive you want to copy the file from:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error)      |
| **Original File ID**      | Enter (map) the File ID of the original file you want to copy.                                                                                                                                                                        |
| **New Drive Location**    | Select the target drive you want to copy the file to:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **New Folder Location**   | Select the target folder you want to copy the file to.                                                                                                                                                                                |
| **Copied File Name**      | Enter the new file name if you want to change the name of the file in the target location.                                                                                                                                            |
:::

:::ExpandableHeading
## Move a File/Folder

Moves a file or folder to the new target location.

| **Field**               | **Description**                                                                                                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**          | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                               |
| **Choose a Drive**      | Select the drive you want to move the file or folder from:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error)      |
| **Select File/Folder**  | Select whether you want to move a file or folder.                                                                                                                                                                                               |
| **File ID/ Folder ID**  | Enter (map) the File ID (or Folder ID) of the file (or folder) you want to move.                                                                                                                                                                |
| **New Drive Location**  | Select the target drive you want to move the file or folder to:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error) |
| **New Folder Location** | Select the target folder you want to move the file or folder to.                                                                                                                                                                                |
:::

# File/Folder Access

:::ExpandableHeading
## Get a Share Link

Retrieves and sets up permissions and sends share link for a file or folder.

| **Field**                               | **Description**                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**                          | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                                                                                                                                                                                          |
| **Choose a Drive**                      | Select the drive that contains the file or folder you want to share:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.&#x20;**&#x4F;ther users will get the `Invalid Value` error)                                                                                                                                                       |
| **Use Domain Admin Access**             | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.                                                                                                                                                                                                                         |
| **Select File/Folder**                  | Select whether you want to share a file or folder.                                                                                                                                                                                                                                                                                                                                                         |
| **File ID/ Folder ID**                  | Enter (map) the File ID (or Folder ID) of the file (or folder) you want to share.                                                                                                                                                                                                                                                                                                                          |
| **Role**                                | Select the role granted by this permission to define what users can do with a file or folder.<br />* Owner
* Writer
* Commenter
* Reader
* Organizer
* File Organizer
* Owner
* Writer
* Commenter
* Reader
* Organizer
* File Organizer<br />For the list of operations users can perform for each role, please refer to the [Roles](https://developers.google.com/drive/api/v3/ref-roles) documentation. |
| **Type**                                | Select permission for the file or folder. Permission grants a user, group, domain, or the anyone access to a folder hierarchy or to the file.                                                                                                                                                                                                                                                              |
| **Email address / Organization Domain** | Enter the email address or organization domain you want to restrict access to the file or folder to.                                                                                                                                                                                                                                                                                                       |
| **Send notification email**             | The notification email with the link will be sent to the specified email address.                                                                                                                                                                                                                                                                                                                          |
| **Send Notification Email**             | Enter the expiration time. The expiration time must be future and cannot be more than a year in the future.                                                                                                                                                                                                                                                                                                |
| **Allow File Discovery**                | Enable to define whether the permission allows the file to be discovered through search.                                                                                                                                                                                                                                                                                                                   |
:::

:::ExpandableHeading
## Update a File/Folder Access

Updates an existing file or folder access.

| **Field**                   | **Description**                                                                                                                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**              | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                      |
| **Choose a Drive**          | Select the drive whose access you want to update:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.** Other users will get the Invalid Value error). |
| **Select**                  | Select whether you want to move a file or folder.                                                                                                                                                                      |
| **File ID**                 | Select the File ID whose access you want to update.                                                                                                                                                                    |
| **Folder ID**               | Select the Folder ID whose access you want to update.                                                                                                                                                                  |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.                                     |
| **Shared Drive**            | Select the shared drive whose file or folder access you want to update.                                                                                                                                                |
| **Permission ID**           | Shows users you would like to update access for a file.                                                                                                                                                                |
| **Role**                    | Select the role:<br />* Owner
* Writer
* Commenter
* Reader                                                                                                                                                            |
:::

:::ExpandableHeading
## Revoke a File/Folder Access

Revokes a file or folder access.

| **Field**                   | **Description**                                                                                                                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**              | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                      |
| **Choose a Drive**          | Select the drive whose access you want to update:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.** Other users will get the Invalid Value error). |
| **Select**                  | Select whether you want to revoke access from a file or folder.                                                                                                                                                        |
| **File ID**                 | Select the File ID whose access you want to update.                                                                                                                                                                    |
| **Folder ID**               | Select the Folder ID whose access you want to update.                                                                                                                                                                  |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.                                     |
| **Shared Drive**            | Select the shared drive whose file or folder access you want to update.                                                                                                                                                |
| **Permission ID**           | Shows users you would like to revoke access from a file.                                                                                                                                                               |
:::

# Google Shared Drive (for Google Workspace Users only)

:::hint{type="info"}
The Google Workspace administrator privilege is required in order to use these modules
:::

:::ExpandableHeading
## Watch Shared Drives

Triggers when a shared drive is created.

| **Field**        | **Description**                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connection**   | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                |
| **Search**       | Select whether you want to filter returned drives by **custom search query** or **query filter**.                                                                                                |
| **Query filter** | Set the filter to filter returned shared drives by **name**, **organizer count**, or **member count**. You can also use AND and OR operators to combine the filter.                              |
| **Query**        | Enter your custom search query. For example:`name contains 'Make' and memberCount >= 20` For more info, see the [documentation](https://developers.google.com/drive/api/v3/search-shareddrives). |
| **Limit**        | Set the maximum number of drives Make will return during one execution cycle.                                                                                                                    |
:::

:::ExpandableHeading
## Search for Shared Drives

Searches for the Google shared drive with query options.

| **Field**        | **Description**                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connection**   | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                |
| **Search**       | Select whether you want to filter returned drives by **custom search query** or **query filter**.                                                                                                |
| **Query filter** | Set the filter to filter returned shared drives by **name**, **organizer count**, or **member count**. You can also use AND and OR operators to combine the filter.                              |
| **Query**        | Enter your custom search query. For example:`name contains 'Make' and memberCount >= 20` For more info, see the [documentation](https://developers.google.com/drive/api/v3/search-shareddrives). |
| **Limit**        | Set the maximum number of drives Make will return during one execution cycle.                                                                                                                    |
:::

:::ExpandableHeading
## Create a Shared Drive

Creates a new shared drive.

| **Field**                   | **Description**                                                                   |
| --------------------------- | --------------------------------------------------------------------------------- |
| **Connection**              | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx). |
| **New Shared Drive's Name** | Enter the name for the new shared drive.                                          |
:::

:::ExpandableHeading
## Get a Shared Drive

Retrieves shared drive's metadata by ID.

| **Field**           | **Description**                                                                   |
| ------------------- | --------------------------------------------------------------------------------- |
| **Connection**      | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx). |
| **Shared Drive ID** | Enter (map) the ID or select the drive you want to retrieve details about.        |
:::

:::ExpandableHeading
## Update a Shared Drive

Updates an existing drive's name and/or restrictions. For admins only.

| **Field**           | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connection**      | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Shared Drive ID** | Enter (map) the ID or select the drive you want to update.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Name**            | Enter the new name for the shared drive.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Restrictions**    | Enable or disable restrictions that apply to this shared drive or items inside this shared drive.<br />* Admin Managed Restrictions: Select whether administrative privileges on this shared drive are required to modify restrictions.    &#x20;
* Copy Requires Writer Permission: Select whether the options to copy, print, or download files inside this shared drive, should be disabled for readers and commenters. When this restriction is enabled, it will override the similarly named field to true for any file inside this shared drive.    &#x20;
* Domain Users Only: Select whether access to this shared drive and items inside this shared drive is restricted to users of the domain to which this shared drive belongs. This restriction may be overridden by other sharing policies controlled outside of this shared drive.    &#x20;
* Drive Members Only: Select whether access to items inside this shared drive is restricted to its members. |
:::

:::ExpandableHeading
## Delete a Shared Drive

Delete's an empty shared drive.

| **Field**           | **Description**                                                                   |
| ------------------- | --------------------------------------------------------------------------------- |
| **Connection**      | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx). |
| **Shared Drive ID** | Enter (map) the ID or select the drive you want to delete.                        |
:::

# File Revision

:::ExpandableHeading
## List File Revision

Retrieves a list of file's revisions.

| **Field**                   | **Description**                                                                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connection**              | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                          |
| **Enter a File ID**         | Select whether you want to enter (map) the file ID manually or select the file using the menu.                                                                                             |
| **Choose a Drive**          | Select the location:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.** Other users will get the `Invalid Value` error) |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.         |
| **Shared Drive**            | Select or map the shared drive whose file revisions you want to list.                                                                                                                      |
| **File ID**                 | Select the File ID whose revisions you want to list.                                                                                                                                       |
| **File ID**                 | Enter the File ID whose revisions you want to list.                                                                                                                                        |
| **Limit**                   | Set the maximum number of revisions Make will return during one execution cycle. The default value is 10.                                                                                  |
:::

:::ExpandableHeading
## Get a File Revision

Gets a specified file's revision.

| **Field**                   | **Description**                                                                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connection**              | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                          |
| **Enter a File ID**         | Select whether you want to enter (map) the file ID manually or select the file using the menu.                                                                                             |
| **Choose a Drive**          | Select the location:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.** Other users will get the `Invalid Value` error) |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.         |
| **Shared Drive**            | Select or map the shared drive whose file's revision you want to retrieve.                                                                                                                 |
| **File ID**                 | Select the File ID whose revision you want to retrieve.                                                                                                                                    |
| **File ID**                 | Enter the File ID whose revision you want to retrieve.                                                                                                                                     |
| **Revision ID**             | Enter the Revision ID to retrieve.                                                                                                                                                         |
| **Acknowledge Abuse**       | Select whether the user knowledges the risk of downloading known malware or other abusive files.                                                                                           |
:::

:::ExpandableHeading
## Update a File Revision

Updates an existing file's revision.

| **Field**                    | **Description**                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**               | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                                                                                                                               |
| **Enter a File ID**          | Select whether you want to enter (map) the file ID manually or select the file using the menu.                                                                                                                                                                                                  |
| **Choose a Drive**           | Select the location:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.** Other users will get the `Invalid Value` error)                                                                                                      |
| **File ID**                  | Select the File ID whose revision you want to update.                                                                                                                                                                                                                                           |
| **Use Domain Admin Access**  | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.                                                                                                              |
| **Shared Drive**             | Select or map the shared drive whose file's revision you want to update                                                                                                                                                                                                                         |
| **File ID**                  | Enter the File ID whose revision you want to update.                                                                                                                                                                                                                                            |
| **Revision ID**              | Enter the Revision ID you want to update.                                                                                                                                                                                                                                                       |
| **Keep Forever**             | Select whether to keep this revision forever, even if it is no longer the head revision. If not set, the revision will automatically purge 30 days after newer content is uploaded. You can set a maximum of 200 revisions for a file. This applies only to files with binary content in Drive. |
| **Publish Auto**             | Select whether to republish subsequent revisions automatically. This is only applicable to Docs Editors files.                                                                                                                                                                                  |
| **Published**                | Select whether this revision is published. This is only applicable to Docs Editors files.                                                                                                                                                                                                       |
| **Published Outside Domain** | Select whether this revision is published outside the domain. This is only applicable to Docs Editors files.                                                                                                                                                                                    |
:::

:::ExpandableHeading
## Delete a File Revision

Deletes a file's revision.

| **Field**                   | **Description**                                                                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connection**              | [Create a connection to your Google Drive account](docId\:CT1o6eSjM1F0Xm3Wk5nBx).                                                                                                          |
| **Enter a File ID**         | Select whether you want to enter (map) the file ID manually or select the file using the menu.                                                                                             |
| **Choose a Drive**          | Select the location:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.** Other users will get the `Invalid Value` error) |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.         |
| **Shared Drive**            | Select or map the shared drive whose file's revision you want to delete.                                                                                                                   |
| **File ID**                 | Select the File ID whose revision you want to delete.                                                                                                                                      |
| **File ID**                 | Enter the File ID whose revision you want to delete.                                                                                                                                       |
| **Revision ID**             | Enter the Revision ID you want to delete.                                                                                                                                                  |
:::

# Other

:::ExpandableHeading
## Watch Comments

Triggers when a comment is added or modified on the selected file.

| **Field**          | **Description**                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connection**     | Establish a connection to your Google drive account.                                                                                                                                       |
| **Watch Comments** | Select whether you want to watch new comments (**By Created Time**) or modified comments (**By Modified Time**)                                                                            |
| **Choose a Drive** | Select the location:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.** Other users will get the `Invalid Value` error) |
| **File ID**        | Navigate to and select the file you want to watch for comments.                                                                                                                            |
| **Limit**          | Set the maximum number of comments Make will return during one execution cycle.                                                                                                            |
:::

:::ExpandableHeading
## Get a Folder ID for a Path

Retrieves a folder ID for a folder path.

| **Field**       | **Description**                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**  | Establish a connection to your Google drive account.                                                                                                                    |
| **Folder Path** | Enter the folder path whose Folder ID you want to retrieve. For example, `abc/xyz`.<br />It is not recommended to have subfolders with the same name inside one folder. |
:::

:::ExpandableHeading
## Get a File/Folder Path for an ID

Retrieves a file or folder path for an ID.

| **Field**                   | **Description**                                                                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connection**              | Establish a connection to your Google drive account.                                                                                                                                       |
| **Enter a File/Folder ID**  | Select whether you want to enter (map) the File/Folder ID manually or select the file using the menu.                                                                                      |
| **Choose a Drive**          | Select the location:<br />* My Drive
* Shared With Me
* Google Shared Drive (**This option is available for Google Workspace users only.** Other users will get the `Invalid Value` error) |
| **Select File/Folder**      | Select the file/folder whose path you want to retrieve.                                                                                                                                    |
| **File ID**                 | Enter the File ID whose path you want to retrieve                                                                                                                                          |
| **Folder ID**               | Enter the Folder ID whose path you want to retrieve.                                                                                                                                       |
| **Use Domain Admin Access** | Select whether to issue the request as a domain administrator.<br />If set to `Yes`, then all shared drives of the domain in which the requester is an administrator are returned.         |
| **Shared Drive**            | Select the shared drive of the file/folder whose path you want to retrieve.                                                                                                                |
:::

:::ExpandableHeading
## Make an API Call

Allows you to perform a custom API call.

| **Field**        | **Description**                                                                                                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Connection**   | Establish a connection to your Google drive account.                                                                                                                                                                                   |
| **URL**          | Enter a path relative to `https://www.googleapis.com/drive`. For example, `/v3/files`.<br />For the list of available endpoints, refer to the [Google Drive API Documentation](https://developers.google.com/drive/api/v3/reference).  |
| **Method**       | Select the HTTP method you want to use:<br />* GET to retrieve information for an entry.
* POST to create a new entry.
* PUT to update/replace an existing entry.
* PATCH to make a partial entry update.
* DELETE to delete an entry. |
| **Headers**      | Enter the desired request headers. You don't have to add authorization headers; we already did that for you.                                                                                                                           |
| **Query String** | Enter the request query string.                                                                                                                                                                                                        |
| **Body**         | Enter the body content for your API call.                                                                                                                                                                                              |

The following API call returns all files in your Google Drive:

::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/Kn17Tp8BYcLuaGeKaZGgq_uuid-1eca5735-3d7a-aff9-0d0d-698d374f1dcd.png" size="60" width="297" height="696" position="flex-start" alt="Make an API call" showCaption="false"}

The result can be found in the module's Output under Bundle > Body > files. In our example, 30 files were returned:

::Image[]{src="https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/gwVYoEdheC63sJ-G_pXYq_uuid-c323393e-7cdf-306f-2e46-85d2e97282c6.png" size="60" width="445" height="645" position="flex-start" alt="Make an API Call output" showCaption="false"}
:::
