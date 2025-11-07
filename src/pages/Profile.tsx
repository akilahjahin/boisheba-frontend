import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  updateProfile,
  changePassword,
  getCurrentUser,
  User,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { Loader2, User as UserIcon, Lock, MapPin } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Profile form state
  const [profileForm, setProfileForm] = useState<UpdateProfilePayload>({
    name: "",
    bio: "",
    profileImageUrl: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    latitude: undefined,
    longitude: undefined,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordPayload>({
    currentPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load current user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        
        // Pre-fill profile form with current data
        setProfileForm({
          name: userData.name || "",
          bio: userData.bio || "",
          profileImageUrl: userData.profileImageUrl || "",
          address: userData.address || "",
          city: userData.city || "",
          district: userData.district || "",
          postalCode: userData.postalCode || "",
          latitude: userData.latitude,
          longitude: userData.longitude,
        });
      } catch (error) {
        toast.error("Failed to load user data");
        navigate("/login");
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);

    try {
      // Only send fields that have values
      const payload: UpdateProfilePayload = {};
      
      if (profileForm.name?.trim()) payload.name = profileForm.name.trim();
      if (profileForm.bio?.trim()) payload.bio = profileForm.bio.trim();
      if (profileForm.profileImageUrl?.trim()) payload.profileImageUrl = profileForm.profileImageUrl.trim();
      if (profileForm.address?.trim()) payload.address = profileForm.address.trim();
      if (profileForm.city?.trim()) payload.city = profileForm.city.trim();
      if (profileForm.district?.trim()) payload.district = profileForm.district.trim();
      if (profileForm.postalCode?.trim()) payload.postalCode = profileForm.postalCode.trim();
      if (profileForm.latitude !== undefined && profileForm.latitude !== null) payload.latitude = profileForm.latitude;
      if (profileForm.longitude !== undefined && profileForm.longitude !== null) payload.longitude = profileForm.longitude;

      const updatedUser = await updateProfile(payload);
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsLoadingPassword(true);

    try {
      await changePassword(passwordForm);
      toast.success("Password changed successfully!");
      
      // Reset form
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setConfirmPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change password";
      toast.error(message);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-boisheba-600" />
      </div>
    );
  }

  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profileImageUrl || user?.avatar || ""} />
                <AvatarFallback className="bg-boisheba-100 text-boisheba-700 text-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                {user?.phone && (
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Profile and Password */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and location details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Basic Information
                    </h3>
                    
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, name: e.target.value })
                          }
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileForm.bio}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, bio: e.target.value })
                          }
                          placeholder="Tell us about yourself..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                        <Input
                          id="profileImageUrl"
                          type="url"
                          value={profileForm.profileImageUrl}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              profileImageUrl: e.target.value,
                            })
                          }
                          placeholder="https://example.com/your-image.jpg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location Information
                    </h3>
                    
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={profileForm.address}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, address: e.target.value })
                          }
                          placeholder="House number, street name"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={profileForm.city}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, city: e.target.value })
                            }
                            placeholder="e.g., Dhaka"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="district">District</Label>
                          <Input
                            id="district"
                            value={profileForm.district}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                district: e.target.value,
                              })
                            }
                            placeholder="e.g., Dhaka"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={profileForm.postalCode}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              postalCode: e.target.value,
                            })
                          }
                          placeholder="e.g., 1209"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude (Optional)</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="any"
                            value={profileForm.latitude ?? ""}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                latitude: e.target.value ? parseFloat(e.target.value) : undefined,
                              })
                            }
                            placeholder="23.8103"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude (Optional)</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="any"
                            value={profileForm.longitude ?? ""}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                longitude: e.target.value ? parseFloat(e.target.value) : undefined,
                              })
                            }
                            placeholder="90.4125"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-boisheba-600 hover:bg-boisheba-700"
                    disabled={isLoadingProfile}
                  >
                    {isLoadingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password (min. 6 characters)"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-boisheba-600 hover:bg-boisheba-700"
                    disabled={isLoadingPassword}
                  >
                    {isLoadingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
