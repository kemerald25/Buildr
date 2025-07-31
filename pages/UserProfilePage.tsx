import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { User } from "../types";
import {
  getUserProfile,
  findOrCreateChat,
  followUser,
  unfollowUser,
} from "../services/firebase";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/Spinner";
import Tag from "../components/Tag";
import PortfolioLinkIcon from "../components/PortfolioLinkIcon";
import {
  Edit,
  Plus,
  MessageSquare,
  Check,
  User as UserIcon,
  BrainCircuit,
} from "lucide-react";

// A placeholder for where user-generated content (like their ideas) would go
const UserContentPlaceholder: React.FC = () => (
  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl ring-1 ring-slate-200/80 shadow-lg text-center h-full flex flex-col justify-center">
    <BrainCircuit className="mx-auto w-12 h-12 text-slate-300 mb-4" />
    <h3 className="text-xl font-bold text-slate-700">User's Ideas</h3>
    <p className="text-slate-500 mt-2">
      Projects and ideas by this builder will appear here.
    </p>
  </div>
);

const UserProfilePage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid) return;
      setLoading(true);
      try {
        const userProfile = await getUserProfile(uid);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [uid]);

  useEffect(() => {
    if (currentUser && profile) {
      setIsFollowing(currentUser.following.includes(profile.uid));
    }
  }, [currentUser, profile]);

  const handleMessage = async () => {
    if (!currentUser || !profile) return;
    try {
      const chatId = await findOrCreateChat(currentUser.uid, profile.uid);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to create or find chat:", error);
      alert("Could not start a chat. Please try again.");
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profile || isFollowLoading) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUser.uid, profile.uid);
        setProfile((p) =>
          p ? { ...p, followersCount: p.followersCount - 1 } : null
        );
        setIsFollowing(false);
      } else {
        await followUser(currentUser.uid, profile.uid);
        setProfile((p) =>
          p ? { ...p, followersCount: p.followersCount + 1 } : null
        );
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to follow/unfollow user:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const isOwnProfile = currentUser?.uid === profile?.uid;

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (!profile) return <div className="text-center py-20">User not found.</div>;

  return (
    // Main wrapper with consistent background
    <div className="bg-slate-50 font-sans antialiased text-slate-800 relative min-h-screen pt-[100px]">
      <div className="absolute top-0 left-0 w-full h-full" aria-hidden="true">
        <div className="top-[15%] right-[-10rem] w-[40rem] h-[40rem] bg-blue-200/40 rounded-full filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-[5%] left-[-15rem] w-[50rem] h-[50rem] bg-cyan-200/30 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl ring-1 ring-slate-200/80 shadow-xl p-6 mb-8 text-center">
          {/* Overlapping Avatar */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto -mt-20 md:-mt-24">
            <img
              src={profile.pfpUrl || "/default-avatar.png"}
              alt={profile.displayName}
              className="w-full h-full rounded-full object-cover ring-4 ring-white shadow-lg"
            />
          </div>

          <div className="mt-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {profile.displayName}
            </h1>
            <p className="text-lg text-slate-600 mt-1">
              {profile.headline || "Innovator & Builder"}
            </p>

            {/* Social Links */}
            <div className="mt-4 flex items-center justify-center gap-4">
              {profile.portfolioLinks?.map((link) => (
                <PortfolioLinkIcon key={link.type} link={link} />
              ))}
            </div>

            {/* Stats & Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-6 text-slate-500">
                <span className="text-center">
                  <strong className="block text-xl text-slate-800">
                    {profile.followersCount || 0}
                  </strong>{" "}
                  Followers
                </span>
                <span className="text-center">
                  <strong className="block text-xl text-slate-800">
                    {profile.following?.length || 0}
                  </strong>{" "}
                  Following
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                {isOwnProfile ? (
                  <Link
                    to="/profile/edit"
                    className="group inline-flex items-center justify-center bg-gradient-to-br from-base-blue to-cyan-400 text-white font-bold py-2.5 px-6 rounded-full text-base transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
                  >
                    <Edit size={16} className="mr-2" /> Edit Profile
                  </Link>
                ) : currentUser ? (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      className={`group inline-flex items-center justify-center font-bold py-2.5 px-6 rounded-full text-base transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait ${
                        isFollowing
                          ? "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                          : "bg-gradient-to-br from-base-blue to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/30"
                      }`}
                    >
                      {isFollowing ? (
                        <Check size={16} className="mr-2 text-green-500" />
                      ) : (
                        <Plus size={16} className="mr-2" />
                      )}
                      {isFollowLoading
                        ? "..."
                        : isFollowing
                        ? "Following"
                        : "Follow"}
                    </button>
                    <button
                      onClick={handleMessage}
                      className="group inline-flex items-center justify-center bg-white text-slate-700 font-bold py-2.5 px-6 rounded-full text-base ring-1 ring-slate-300 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:bg-slate-50"
                    >
                      <MessageSquare size={16} className="mr-2" /> Message
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: User's Content (Ideas, Projects, etc.) */}
          <div className="lg:col-span-2">
            <UserContentPlaceholder />
          </div>

          {/* Right Column: About and Skills */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl ring-1 ring-slate-200/80 shadow-lg">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserIcon size={20} /> About
              </h2>
              <p className="text-slate-600 leading-relaxed mt-4">
                {profile.bio || "This user hasn't written a bio yet."}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl ring-1 ring-slate-200/80 shadow-lg">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill) => <Tag key={skill}>{skill}</Tag>)
                ) : (
                  <p className="text-sm text-slate-500">No skills listed.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
