"use client";

import { useLiveQuery } from "dexie-react-hooks";
import * as repo from "./repo";

// 資料一變動就自動重新渲染。伺服器端與首次渲染時回傳 undefined，代表「載入中」

export const useDeities = () => useLiveQuery(repo.listDeities);
export const useQuestions = () => useLiveQuery(repo.listQuestions);
export const useSelectedQuestions = () => useLiveQuery(repo.listSelectedQuestions);
export const useVisits = () => useLiveQuery(repo.listVisits);
export const useVows = () => useLiveQuery(repo.listVows);
export const useProfile = () => useLiveQuery(repo.getProfile);
export const usePreferences = () => useLiveQuery(repo.getPreferences);
