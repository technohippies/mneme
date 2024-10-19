import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../components/ui/form";
import CloseHeader from '../layout/CloseHeader';
import { MagnifyingGlass, CircleNotch } from "@phosphor-icons/react";
import { setName } from '../../services/namestoneService';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const formSchema = z.object({
  subdomain: z.string().min(3, "Subdomain must be at least 3 characters long"),
});

const DomainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [existingDomain, setExistingDomain] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subdomain: "",
    },
  });

  const checkAvailability = (values: z.infer<typeof formSchema>) => {
    console.log(`Checking availability for: ${values.subdomain}.vstudent.eth`);
    setIsChecking(true);
    // Simulate API call
    setTimeout(() => {
      // Use a deterministic method to check availability
      const available = values.subdomain.length % 2 === 0;
      console.log(`Domain ${values.subdomain}.vstudent.eth is ${available ? 'available' : 'not available'}`);
      setIsAvailable(available);
      setIsChecking(false);
      console.log(`isAvailable state set to: ${available}`);
    }, 1000);
  };

  const claimDomain = async (values: z.infer<typeof formSchema>) => {
    console.log(`Attempting to claim domain: ${values.subdomain}.vstudent.eth`);
    try {
      const success = await setName({
        name: `${values.subdomain}.vstudent.eth`,
        address: user?.address || '',
        text_records: {}
      });
      
      if (success) {
        console.log(`Successfully claimed domain: ${values.subdomain}.vstudent.eth`);
        localStorage.setItem('vstudentDomain', `${values.subdomain}.vstudent.eth`);
        navigate('/profile');
      } else {
        console.log(`Failed to claim domain: ${values.subdomain}.vstudent.eth`);
        // Show an error message to the user here
      }
    } catch (error) {
      console.error('Error claiming domain:', error);
      // Show an error message to the user here
    }
  };

  const premiumDomains = [
    { name: '👑.✌️', price: '$10000/year', punycode: 'xn--2p8h.xn--7bi' },
    { name: 'x.✌️', price: '$4200/year', punycode: 'x.xn--7bi' },
    { name: 'qi.✌️', price: '$420/year', punycode: 'qi.xn--7bi' },
    { name: 'lin.✌️', price: '$20/year', punycode: 'lin.xn--7bi' },
    { name: 'chan.✌️', price: '$5/year', punycode: 'chan.xn--7bi' },
    { name: 'queen.✌️', price: '$1/year', punycode: 'queen.xn--7bi' },
  ];

  useEffect(() => {
    const storedDomain = localStorage.getItem('vstudentDomain');
    if (storedDomain) {
      setExistingDomain(storedDomain);
      console.log(`Retrieved existing vstudent.eth domain: ${storedDomain}`);
    }
  }, []);

  useEffect(() => {
    console.log(`isAvailable state changed to: ${isAvailable}`);
  }, [isAvailable]);

  useEffect(() => {
    console.log('DomainPage - Current language:', i18n.language);
    console.log('DomainPage - Available languages:', i18n.languages);
  }, [i18n.language]);

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-neutral-300">
      <CloseHeader onAction={handleClose} type="close" fallbackPath="/profile" />
      <div className="flex-grow p-4 overflow-y-auto">
        {!existingDomain && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-100 mb-4">
              {t('domain.claimFreeDomain')}
            </h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(checkAvailability)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder={t('domain.enterSubdomain')}
                            className="pl-10 pr-20 bg-neutral-700 border-neutral-600 text-neutral-100"
                          />
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400">
                            .vstudent.eth
                          </span>
                          <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isChecking} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isChecking ? <CircleNotch weight="bold" className="mr-2 h-4 w-4 animate-spin" /> : t('domain.checkAvailability')}
                </Button>
              </form>
            </Form>
            {isAvailable !== null && (
              <p className={`mt-2 ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                {isAvailable ? t('domain.domainAvailable') : t('domain.domainNotAvailable')}
              </p>
            )}
            {isAvailable && (
              <Button 
                onClick={() => claimDomain(form.getValues())} 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t('domain.claimDomain')}
              </Button>
            )}
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-neutral-100 mb-4">
            {t('domain.premiumDomains')}
          </h2>
          {existingDomain && (
            <p className="mb-4 text-neutral-300">
              {t('domain.currentDomain')} <strong>{existingDomain}</strong>
            </p>
          )}
          <div className="space-y-4">
            {premiumDomains.map((domain, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{domain.name}</span>
                <div className="space-x-2">
                  <span className="text-neutral-400">{domain.price}</span>
                  <Button 
                    variant="secondary"
                    className="bg-neutral-700 hover:bg-neutral-600 text-white"
                    onClick={() => window.open(`https://hns.id/register/${domain.punycode}`, '_blank')}
                  >
                    {t('domain.buy')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button 
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.open('https://hns.id/tld/xn--7bi/domains', '_blank')}
          >
            {t('domain.searchDomains')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DomainPage;
