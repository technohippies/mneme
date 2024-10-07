import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Camera } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getName, setName, uploadToPinata, checkDomainAvailability } from "../../services/namestoneService";
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from "../../hooks/useDebounce";
import CloseHeader from "../layout/CloseHeader";
import { orbit, tailspin } from 'ldrs';
import { checkIfUserHasList } from '../../services/efp/efpService';

// Register the loaders
orbit.register();
tailspin.register();

const formSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  xHandle: z.string().optional(),
  nostrHandle: z.string().optional(),
  weiboHandle: z.string().optional(),
  wechatHandle: z.string().optional(),
});

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [coverUrl, setCoverUrl] = useState<string>('/images/user_cover.png');
  const [isDomainAvailable, setIsDomainAvailable] = useState<boolean | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [hasExistingName, setHasExistingName] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasEFPList, setHasEFPList] = useState<boolean | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: "",
      xHandle: "",
      nostrHandle: "",
      weiboHandle: "",
      wechatHandle: "",
    },
  });

  const debouncedDomain = useDebounce(form.watch('domain'), 500);

  useEffect(() => {
    if (debouncedDomain && !hasExistingName) {
      setIsCheckingDomain(true);
      checkDomainAvailability(debouncedDomain).then((available) => {
        setIsDomainAvailable(available);
        setIsCheckingDomain(false);
      });
    } else {
      setIsDomainAvailable(null);
      setIsCheckingDomain(false);
    }
  }, [debouncedDomain, hasExistingName]);

  useEffect(() => {
    const checkEFPList = async () => {
      if (address) {
        const userHasList = await checkIfUserHasList(address);
        setHasEFPList(userHasList);
      }
    };
    checkEFPList();
  }, [address]);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getName(address);
      if (data && Array.isArray(data) && data.length > 0) {
        setNames(data.map(record => record.name));
        const latestRecord = data[data.length - 1];
        setHasExistingName(true);
        form.reset({
          domain: latestRecord.name,
          xHandle: latestRecord.text_records?.['com.twitter'] || '',
          nostrHandle: latestRecord.text_records?.['org.nostr'] || '',
          weiboHandle: latestRecord.text_records?.['com.weibo'] || '',
          wechatHandle: latestRecord.text_records?.['com.wechat'] || '',
        });
        setAvatarUrl(latestRecord.text_records?.avatar || '/images/avatar.png');
        setCoverUrl(latestRecord.text_records?.cover || '/images/user_cover.png');
      } else {
        setHasExistingName(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [address, form]);

  useEffect(() => {
    if (!address) {
      const storedAddress = localStorage.getItem('walletAddress');
      setAddress(user?.address || storedAddress || '');
    }
  }, [user, address]);

  useEffect(() => {
    if (address) {
      loadProfile();
    }
  }, [address, loadProfile]);

  const handleAvatarUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAvatarUploading(true);
    try {
      const ipfsHash = await uploadToPinata(file);
      const newAvatarUrl = `https://aquamarine-blank-guanaco-507.mypinata.cloud/ipfs/${ipfsHash}`;
      setAvatarUrl(newAvatarUrl);
      console.log('New avatar URL:', newAvatarUrl);

      const success = await setName({
        domain: 'vstudent.eth',
        name: form.getValues().domain,
        address: address,
        text_records: {
          ...form.getValues(),
          avatar: newAvatarUrl || '/images/avatar.png',
          cover: coverUrl || '/images/user_cover.png'
        }
      });

      if (success) {
        console.log('Avatar updated successfully in Namestone');
      } else {
        console.error('Failed to update avatar in Namestone');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setIsAvatarUploading(false);
    }
  }, [address, form, coverUrl]);

  const handleCoverUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCoverUploading(true);
    try {
      const ipfsHash = await uploadToPinata(file);
      const newCoverUrl = `https://aquamarine-blank-guanaco-507.mypinata.cloud/ipfs/${ipfsHash}`;
      setCoverUrl(newCoverUrl);
      console.log('New cover URL:', newCoverUrl);

      const success = await setName({
        domain: 'vstudent.eth',
        name: form.getValues().domain,
        address: address,
        text_records: {
          ...form.getValues(),
          avatar: avatarUrl || '/images/avatar.png',
          cover: newCoverUrl
        }
      });

      if (success) {
        console.log('Cover updated successfully in Namestone');
      } else {
        console.error('Failed to update cover in Namestone');
      }
    } catch (error) {
      console.error('Error updating cover:', error);
    } finally {
      setIsCoverUploading(false);
    }
  }, [address, form, avatarUrl]);

  const onSubmit = useCallback(async (data: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      const success = await setName({
        domain: 'vstudent.eth',
        name: data.domain,
        address: address,
        text_records: {
          'com.twitter': data.xHandle || '',
          'org.nostr': data.nostrHandle || '',
          'com.weibo': data.weiboHandle || '',
          'com.wechat': data.wechatHandle || '',
          avatar: avatarUrl || '/images/avatar.png',
          cover: coverUrl || '/images/user_cover.png',
        }
      });
      if (success) {
        console.log('Profile updated successfully');
        navigate('/profile');
        // Add a success toast notification here
      } else {
        console.error('Failed to update profile');
        // Add an error toast notification here
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Add an error toast notification here
    } finally {
      setIsSaving(false);
    }
  }, [address, avatarUrl, coverUrl, navigate]);

  return (
    <div className="bg-neutral-900 min-h-screen w-full text-white">
      <CloseHeader onAction={() => navigate('/profile')} type="close" fallbackPath="/profile" />
      <div className="p-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {names.length > 1 && (
            <div className="mb-4">
              <p className="text-sm text-neutral-400">
                Other names associated with this address: {names.filter(name => name !== form.getValues().domain).join(', ')}
              </p>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="flex justify-between mb-8 gap-4">
                <div className="relative w-[40%]">
                  <div className="relative aspect-square rounded-full overflow-hidden">
                    <img 
                      src={avatarUrl || '/images/avatar.png'} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                      {isAvatarUploading ? (
                        <l-tailspin
                          size="40"
                          stroke="5"
                          speed="0.9" 
                          color="white" 
                        ></l-tailspin>
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                      id="avatar-upload"
                      disabled={isAvatarUploading}
                    />
                  </div>
                  <label htmlFor="avatar-upload" className="block text-center mt-2 cursor-pointer">
                    Change Avatar
                  </label>
                </div>
                <div className="relative w-[40%]">
                  <div className="relative aspect-video bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-lg overflow-hidden">
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      {isCoverUploading ? (
                        <l-tailspin
                          size="40"
                          stroke="5"
                          speed="0.9" 
                          color="white" 
                        ></l-tailspin>
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      id="cover-upload"
                      disabled={isCoverUploading}
                    />
                  </div>
                  <label htmlFor="cover-upload" className="block text-center mt-2 cursor-pointer">
                    Change Cover
                  </label>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <FormLabel>Domain Name</FormLabel>
                <Button
                  type="button"
                  onClick={() => navigate('/store')}
                  variant="blue"
                  size="sm"
                >
                  Get Premium
                </Button>
              </div>
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter your domain" 
                          {...field} 
                          className="bg-neutral-800 border-none pr-24" 
                          disabled={hasExistingName}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-neutral-400">.vstudent.eth</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                    {!hasExistingName && (
                      <div className="flex items-center mt-1 h-4">
                        {isCheckingDomain ? (
                          <>
                            <l-orbit size="16" speed="1.5" color="white"></l-orbit>
                            <span className="ml-2 text-xs text-neutral-400">Checking availability...</span>
                          </>
                        ) : isDomainAvailable !== null && (
                          <p className={`text-xs ${isDomainAvailable ? "text-green-500" : "text-red-500"}`}>
                            {isDomainAvailable ? "Domain is available" : "Domain is not available"}
                          </p>
                        )}
                      </div>
                    )}
                  </FormItem>
                )}
              />
              {/* Social Graph section */}
              <div className="mt-6 mb-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Social Graph</FormLabel>
                  {!hasEFPList && (
                    <Button
                      type="button"
                      onClick={() => window.open("https://ethfollow.xyz", "_blank")}
                      variant="blue"
                      size="sm"
                    >
                      Mint Social Graph
                    </Button>
                  )}
                </div>
                {!hasEFPList && (
                  <p className="text-sm text-neutral-400 mt-2">
                    You can't follow or be followed until you have a social graph on Ethereum. 
                  </p>
                )}
              </div>
              <FormField
                control={form.control}
                name="xHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>X.com</FormLabel>
                    <FormControl>
                      <Input placeholder="scarlett" {...field} className="bg-neutral-800 border-none" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nostrHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nostr</FormLabel>
                    <FormControl>
                      <Input placeholder="npub123..." {...field} className="bg-neutral-800 border-none" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weiboHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weibo</FormLabel>
                    <FormControl>
                      <Input placeholder="scarlettxo" {...field} className="bg-neutral-800 border-none" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wechatHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WeChat</FormLabel>
                    <FormControl>
                      <Input placeholder="scarlettxo" {...field} className="bg-neutral-800 border-none" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
      {/* Fixed position footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Button 
            type="submit" 
            variant="blue" 
            className="w-full" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving || isAvatarUploading || isCoverUploading}
          >
            {isSaving ? (
              <l-tailspin
                size="24"
                stroke="4"
                speed="0.9" 
                color="white" 
              ></l-tailspin>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}