import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    githubToken: "",
    defaultBranch: "main",
    autoCreatePR: true,
    notifications: {
      email: true,
      slack: false,
      webhook: false,
    },
    webhookUrl: "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save to localStorage for now (would be API in production)
    localStorage.setItem("autointegrate_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">
        Configure your AutoIntegrate preferences.
      </p>

      <div className="space-y-6">
        {/* GitHub Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🔗</span> GitHub Integration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Access Token
              </label>
              <input
                type="password"
                value={settings.githubToken}
                onChange={(e) =>
                  setSettings({ ...settings, githubToken: e.target.value })
                }
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required for private repositories and PR creation.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Branch
              </label>
              <select
                value={settings.defaultBranch}
                onChange={(e) =>
                  setSettings({ ...settings, defaultBranch: e.target.value })
                }
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="main">main</option>
                <option value="master">master</option>
                <option value="develop">develop</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoCreatePR"
                checked={settings.autoCreatePR}
                onChange={(e) =>
                  setSettings({ ...settings, autoCreatePR: e.target.checked })
                }
                className="rounded"
              />
              <label htmlFor="autoCreatePR" className="text-sm">
                Automatically create pull requests
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🔔</span> Notifications
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="emailNotif"
                checked={settings.notifications.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      email: e.target.checked,
                    },
                  })
                }
                className="rounded"
              />
              <label htmlFor="emailNotif" className="text-sm">
                Email notifications
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="slackNotif"
                checked={settings.notifications.slack}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      slack: e.target.checked,
                    },
                  })
                }
                className="rounded"
              />
              <label htmlFor="slackNotif" className="text-sm">
                Slack notifications
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="webhookNotif"
                checked={settings.notifications.webhook}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      webhook: e.target.checked,
                    },
                  })
                }
                className="rounded"
              />
              <label htmlFor="webhookNotif" className="text-sm">
                Webhook notifications
              </label>
            </div>

            {settings.notifications.webhook && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={settings.webhookUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, webhookUrl: e.target.value })
                  }
                  placeholder="https://your-webhook.com/endpoint"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🔑</span> API Keys
          </h2>

          <p className="text-gray-600 text-sm mb-4">
            Manage your API keys for programmatic access.
          </p>

          <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">
            Generate New API Key
          </button>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            Save Changes
          </button>

          {saved && (
            <span className="text-green-600 text-sm">
              ✓ Settings saved successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
