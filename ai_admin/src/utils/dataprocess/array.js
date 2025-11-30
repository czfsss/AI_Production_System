/**
 * 数组相关工具函数
 */
// 数组去重
export function noRepeat(arr) {
    return [...new Set(arr)];
}
// 查找数组最大值
export function arrayMax(arr) {
    if (!arr.length)
        throw new Error('Array is empty');
    return Math.max(...arr);
}
// 查找数组最小值
export function arrayMin(arr) {
    if (!arr.length)
        throw new Error('Array is empty');
    return Math.min(...arr);
}
// 数组分割
export function chunk(arr, size = 1) {
    if (size <= 0)
        return [arr.slice()];
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
}
// 检查元素出现次数
export function countOccurrences(arr, value) {
    return arr.reduce((count, current) => (current === value ? count + 1 : count), 0);
}
// 扁平化数组
export function flatten(arr, depth = Infinity) {
    return arr.flat(depth);
}
// 返回两个数组的差集
export function difference(arrA, arrB) {
    const setB = new Set(arrB);
    return arrA.filter((item) => !setB.has(item));
}
// 返回两个数组的交集
export function intersection(arr1, arr2) {
    const set2 = new Set(arr2);
    return arr1.filter((item) => set2.has(item));
}
// 从右删除 n 个元素
export function dropRight(arr, n = 0) {
    return arr.slice(0, Math.max(0, arr.length - n));
}
// 返回间隔 nth 的元素
export function everyNth(arr, nth) {
    if (nth <= 0)
        return [];
    return arr.filter((_, i) => i % nth === nth - 1);
}
// 返回第 n 个元素
export function nthElement(arr, n = 0) {
    const index = n >= 0 ? n : arr.length + n;
    return arr[index];
}
// 数组乱序
export function shuffle(arr) {
    const array = [...arr]; // 创建新数组避免修改原数组
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
//# sourceMappingURL=array.js.map