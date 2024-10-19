import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from 'react-i18next';
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { MagnifyingGlass, Spinner } from "@phosphor-icons/react";
import { songService } from '../../services/orbis/songService';
import { Song } from '../../types';
import SongListItem from '../core/SongListItem';
import debounce from 'lodash/debounce';

const formSchema = z.object({
  query: z.string().min(1, "Search query must not be empty"),
});

const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length > 0) {
        setIsSearching(true);
        try {
          const results = await songService.searchSongs(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching songs:', error);
          // You might want to show an error message to the user here
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'query') {
        debouncedSearch(value.query as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedSearch]);

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-neutral-300">
      <div className="flex-grow p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-neutral-100 mb-4">
          {t('search.title')}
        </h2>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder={t('search.placeholder')}
                        className="pl-10 pr-4 bg-neutral-700 border-neutral-600 text-neutral-100"
                      />
                      <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {isSearching && (
          <div className="flex justify-center items-center mt-4">
            <Spinner className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">{t('search.results')}</h3>
            <div className="space-y-4">
              {searchResults.map((song) => (
                <SongListItem key={song.uuid} song={song} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
