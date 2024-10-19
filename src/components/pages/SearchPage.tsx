import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from 'react-i18next';
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { MagnifyingGlass, Spinner } from "@phosphor-icons/react";
import { Song } from '../../types';
import SongListItem from '../core/SongListItem';
import debounce from 'lodash/debounce';
import { songService } from '../../services/orbis/songService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const formSchema = z.object({
  query: z.string().min(1, "Search query must not be empty"),
});

const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [language, setLanguage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const searchSongs = useCallback(async (query: string, lang: string | null) => {
    console.log('SearchPage: Searching songs with query:', query, 'Language:', lang);
    setIsSearching(true);
    try {
      const results = await songService.searchSongs(query, lang);
      console.log('SearchPage: Search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('SearchPage: Error searching songs:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string, lang: string | null) => searchSongs(query, lang), 300),
    [searchSongs]
  );

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'query') {
        console.log('SearchPage: Query changed:', value.query);
        if (value.query) {
          debouncedSearch(value.query, language);
        } else {
          setSearchResults([]);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedSearch, language]);

  const handleLanguageChange = (newLanguage: string | null) => {
    console.log('SearchPage: Language changed to:', newLanguage);
    setLanguage(newLanguage);
    const currentQuery = form.getValues().query;
    console.log('SearchPage: Current query:', currentQuery);
    searchSongs(currentQuery || '', newLanguage); // Use empty string if no query
  };

  const handleDifficultyChange = (newDifficulty: string | null) => {
    console.log('SearchPage: Difficulty changed to:', newDifficulty);
    setDifficulty(newDifficulty);
    // Implement difficulty filtering if needed
  };

  const getLanguageDisplay = (langCode: string | null) => {
    switch (langCode) {
      case 'eng': return 'English';
      case 'spa': return 'Spanish';
      case 'fra': return 'French';
      default: return 'Language';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-neutral-300">
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="flex space-x-4 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-neutral-700 hover:text-neutral-100">
                {getLanguageDisplay(language)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
              <DropdownMenuItem onClick={() => handleLanguageChange(null)}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('eng')}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('spa')}>Spanish</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('fra')}>French</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-neutral-700 hover:text-neutral-100">
                {difficulty || 'Difficulty'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
              <DropdownMenuItem onClick={() => handleDifficultyChange(null)}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDifficultyChange('Easy')}>Easy</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDifficultyChange('Medium')}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDifficultyChange('Hard')}>Hard</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
          <div className="mt-4">
            <div className="space-y-4">
              {searchResults.map((song) => (
                <SongListItem key={song.uuid} song={song} language={language} />
              ))}
            </div>
          </div>
        )}

        {!isSearching && searchResults.length === 0 && (
          <div className="mt-8 text-center text-neutral-400">
            No results found
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
