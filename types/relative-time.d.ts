declare module '@yaireo/relative-time' {
  export default class RelativeTime {
    constructor(options?: { locale: string });

    from(date: Date): string;
  }
}
