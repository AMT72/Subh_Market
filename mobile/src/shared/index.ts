/**
 * نقطة الدخول الموحّدة لطبقة «shared».
 * استورد دائمًا من "@/shared" وليس من الملفات الداخلية، حتى يسهل لاحقًا
 * نقل المجلد كما هو إلى packages/shared في الـ monorepo دون تغيير الاستيرادات.
 */
export * from "./types";
export * from "./mock-data";
export * from "./constants";
export * from "./validation";
export * from "./api";
