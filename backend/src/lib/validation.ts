import {type ZodType} from "zod";

export const parseBody = <T>(schema: ZodType<T>, body: unknown) => {
    return schema.safeParse(body);
};