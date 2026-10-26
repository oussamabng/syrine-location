"use client";
import {useLocale} from '@/lib/i18n';
import type {Translation} from '@/lib/site-content';
export function SiteCopy({value,fallback}:{value?:Translation;fallback:string}){const {locale,t}=useLocale();return <>{value?.[locale]||value?.fr||t(fallback)}</>}
export function CmsText({value}:{value:Translation}){const {locale}=useLocale();return <>{value?.[locale]||value?.fr||value?.en||value?.ar||''}</>}
