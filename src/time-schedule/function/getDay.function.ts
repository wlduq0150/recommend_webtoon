export function getKoreanDayOfWeek(): string {
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeekIndex = new Date().getDay();
    return daysOfWeek[dayOfWeekIndex];
}
