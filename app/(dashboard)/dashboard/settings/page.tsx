"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Shield, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const profile = useQuery(api.profiles.me);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const changePassword = useAction(api.account.changePassword);

  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    setProfileError(null);
    try {
      await updateProfile({ displayName: displayName.trim() || undefined });
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password updated successfully.");
      setTimeout(() => setPasswordSuccess(null), 2500);
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to update password",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-zinc-900 rounded-lg" />
          <div className="h-48 bg-zinc-900 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-zinc-400" />
            <CardTitle className="text-white">Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileError && (
            <div
              className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm"
              role="alert"
              aria-live="polite">
              {profileError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-zinc-300">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            {successMessage && (
              <span
                className="text-sm text-green-400"
                role="alert"
                aria-live="polite">
                {successMessage}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-zinc-400" />
            <CardTitle className="text-white">Account</CardTitle>
          </div>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Email Address</Label>
            <div className="flex items-center gap-2">
              <Input
                value={profile.email ?? ""}
                disabled
                className="bg-zinc-800 border-zinc-700 text-zinc-400"
              />
              <Shield
                className="h-5 w-5 text-green-500"
                aria-label="Verified"
              />
            </div>
            <p className="text-xs text-zinc-500">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Account Type</Label>
            <div className="text-white capitalize">
              {profile.tier ?? "free"}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Member Since</Label>
            <div className="text-white">
              {new Date(profile._creationTime).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-zinc-400" />
            <CardTitle className="text-white">Password</CardTitle>
          </div>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwordError && (
            <div
              className="bg-red-900/50 border border-red-800 rounded-lg p-3 text-red-200 text-sm"
              role="alert"
              aria-live="polite">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div
              className="bg-emerald-900/40 border border-emerald-800 rounded-lg p-3 text-emerald-200 text-sm"
              role="alert"
              aria-live="polite">
              {passwordSuccess}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-zinc-300">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-zinc-300">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-zinc-300">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={handleChangePassword}
              disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-zinc-900 border-red-900/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-400" />
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-sm text-zinc-400">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
