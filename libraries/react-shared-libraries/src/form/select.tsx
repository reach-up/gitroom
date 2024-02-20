"use client";

import {DetailedHTMLProps, FC, SelectHTMLAttributes, useMemo} from "react";
import {clsx} from "clsx";
import {useFormContext} from "react-hook-form";

export const Select: FC<DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {label: string, name: string}> = (props) => {
    const {label, className, ...rest} = props;
    const form = useFormContext();
    const err = useMemo(() => {
        if (!form || !form.formState.errors[props?.name!]) return;
        return form?.formState?.errors?.[props?.name!]?.message! as string;
    }, [form?.formState?.errors?.[props?.name!]?.message]);

    return (
        <div className="flex flex-col gap-[6px]">
            <div className="font-['Inter'] text-[14px]">{label}</div>
            <select {...form.register(props.name)} className={clsx("bg-input h-[44px] px-[16px] outline-none border-fifth border rounded-[4px] text-inputText placeholder-inputText", className)} {...rest}  />
            <div className="text-red-400 text-[12px]">{err || <>&nbsp;</>}</div>
        </div>
    )
}