'use client';
import "reflect-metadata";
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';

import {createContext, FC, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import dayjs from 'dayjs';
import useSWR from "swr";
import {useFetch} from "@gitroom/helpers/utils/custom.fetch";
import {Post, Integration} from '@prisma/client';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);

const CalendarContext = createContext({
  currentWeek: dayjs().week(),
  integrations: [] as Integrations[],
  posts: [] as Array<Post & {integration: Integration}>,
  setFilters: (filters: { currentWeek: number, currentYear: number }) => {},
  changeDate: (id: string, date: dayjs.Dayjs) => {},
});

export interface Integrations {
  name: string;
  id: string;
  identifier: string;
  type: string;
  picture: string;
}
export const CalendarWeekProvider: FC<{ children: ReactNode, integrations: Integrations[] }> = ({
  children,
  integrations
}) => {
  const fetch = useFetch();
  const [internalData, setInternalData] = useState([] as any[]);

  const [filters, setFilters] = useState({
      currentWeek: dayjs().week(),
      currentYear: dayjs().year(),
  });

  const params = useMemo(() => {
    return new URLSearchParams({
        week: filters.currentWeek.toString(),
        year: filters.currentYear.toString(),
    }).toString();
  }, [filters]);

  const loadData = useCallback(async(url: string) => {
    return (await fetch(url)).json();
  }, [filters]);

  const {data, isLoading} = useSWR(`/posts?${params}`, loadData);

  const changeDate = useCallback((id: string, date: dayjs.Dayjs) => {
    setInternalData(d => d.map((post: Post) => {
      if (post.id === id) {
        return {...post, publishDate: date.format('YYYY-MM-DDTHH:mm:ss')};
      }
      return post;
    }));
  }, [data, internalData]);

  useEffect(() => {
    if (data) {
      setInternalData(data);
    }
  }, [data]);

  return (
    <CalendarContext.Provider value={{ ...filters, posts: isLoading ? [] : internalData, integrations, setFilters, changeDate }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => useContext(CalendarContext);