export const toProfileDTO = (profile: any) => {
  return {
    name: `${profile.firstName} ${profile.lastName}`,
    email: profile.userId?.email || "",
    username: profile.userId?.userId || "",
    country: profile.countryId?.name || "",
    phone: profile.phone || "",
    joinDate: profile.joinDate?.toISOString() || "",
    avatar: profile.avatar || "",
  };
};
