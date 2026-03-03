# Privacy Policy for Tabnesia Chrome Extension

**Effective Date:** April 21st 2025

Thank you for using Tabnesia. Your privacy is important to us. This Privacy Policy explains what information the Extension accesses and how it is used. This Extension is designed to operate entirely locally within your browser.

**1. Information We Access**

To provide its features, the Extension requires access to the following browser data:

*   **Tab Information:** Access to details about your open tabs, including their URLs, titles, IDs, active status, and grouping status (via the `tabs` and `tabGroups` permissions). This is necessary to list and analyze your tabs.
*   **Browsing History:** Access to your browsing history (via the `history` permission) is used specifically to determine the last accessed time or usage frequency of tabs, enabling the identification of "Old Tabs" and "Unused Tabs".
*   **Website Favicons:** Access to website URLs (via the `<all_urls>` host permission) is used **solely** to fetch and display the corresponding favicon (website icon) next to each tab listed within the Extension's interface. This improves visual identification of tabs. The Extension does **not** read, modify, or collect content from these websites.
*   **Local Storage:** Access to browser storage (via the `storage` permission) is used to save your user interface preferences (your chosen theme: light or dark) and, locally on your device, the last time each open tab was accessed. This last-access data is used only for the extension’s badge and tab lists and is not sent off your device.

**2. How We Use Information**

The information accessed is used solely for the following purposes **within your local browser**:

*   To display lists of active, inactive, and old tabs with their titles and favicons.
*   To calculate and display tab analytics based on locally processed tab and history data.
*   To allow you to manage your tabs (e.g., close tabs) directly from the Extension interface.
*   To remember your chosen theme setting between sessions.
*   To show the “forgotten tabs” count in the extension icon badge and to categorize tabs (active, inactive, forgotten) using locally stored last-access times.

**All data processing happens locally on your computer within the Chrome browser environment. The Extension does not collect, transmit, or store your browsing data (URLs, history, tab content) on any remote servers.**

**3. Data Storage**

*   **Browsing Data:** Your tab information, browsing history, and website favicons are processed in real-time. Tab content is not stored. Last-access times for open tabs are stored locally so the extension can show the badge count and categorize tabs.
*   **User Settings:** Your selected theme preference is stored persistently using Chrome's `chrome.storage.local` API, which keeps data only on your device.

**4. Data Sharing**

We **do not** share any of the information accessed by the Extension with any third parties. The data remains local to your browser and under your control. We do not sell or transfer your data.

**5. Security**

We rely on the security mechanisms provided by the Google Chrome browser and the `chrome.storage.local` API to protect the data stored locally (theme preference and tab last-access times). Since no data is transmitted or stored remotely, the risk associated with data breaches is minimized.

**6. Children's Privacy**

The Extension is not intended for use by children under the age of 13. We do not knowingly collect any personal information from children under 13.

**7. Changes to This Privacy Policy**

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy at the URL where this policy is hosted. You are advised to review this Privacy Policy periodically for any changes.

**8. Contact Us**

If you have any questions about this Privacy Policy, please contact us at:
mmesasro@gmail.com

---
