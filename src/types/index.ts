// Core types
export interface PaginationOptions {
  totalNumber?: number;
  pageNumber?: number;
  pageSize?: number;
  pageRange?: number;
  showPrevious?: boolean;
  showNext?: boolean;
  showPageNumbers?: boolean;
  showNavigator?: boolean;
  showGoInput?: boolean;
  showGoButton?: boolean;
  showSizeChanger?: boolean;
  sizeChangerOptions?: number[];
  pageLink?: string;
  prevText?: string;
  nextText?: string;
  ellipsisText?: string;
  goButtonText?: string;
  classPrefix?: string;
  activeClassName?: string;
  disableClassName?: string;
  showEllipsis?: boolean;
  ellipsisInputButtonText?: string;
  ellipsisInputClass?: string;
  formatNavigator?:
    | string
    | ((currentPage: number, totalPage: number, totalNumber: number) => string);
  formatGoInput?:
    | string
    | ((input: string, currentPage: number, totalPage: number, totalNumber: number) => string);
  formatGoButton?:
    | string
    | ((button: string, currentPage: number, totalPage: number, totalNumber: number) => string);
  position?: 'top' | 'bottom';
  autoHidePrevious?: boolean | (() => boolean);
  autoHideNext?: boolean | (() => boolean);
  triggerPagingOnInit?: boolean;
  resetPageNumberOnInit?: boolean;
  hideOnlyOnePage?: boolean;
  hideFirstOnEllipsisShow?: boolean;
  hideLastOnEllipsisShow?: boolean;
  groupItems?: boolean;
  groupClass?: string;
  dataSource?: string | any[] | ((callback: (data: any) => void) => void);
  locator?: string | (() => string);
  totalNumberLocator?: (response: any) => number;
  callback?: (data: any, model: PaginationModel) => void;
  onError?: (error: Error, type: string) => void;
  ajax?: AjaxOptions | (() => AjaxOptions);
  ajaxFunction?: (params: any) => void;
  formatAjaxError?: (jqXHR: any, textStatus: string, errorThrown: string) => void;
  beforeInit?: () => boolean | void;
  afterInit?: (el: HTMLElement) => void;
  beforeRender?: (isForced: boolean) => boolean | void;
  afterRender?: (isForced: boolean) => void;
  beforeGoButtonOnClick?: (event: Event, pageNumber: string) => boolean | void;
  afterGoButtonOnClick?: (event: Event, pageNumber: string) => void;
  beforeGoInputOnEnter?: (event: Event, pageNumber: string) => boolean | void;
  afterGoInputOnEnter?: (event: Event, pageNumber: string) => void;
  beforeSizeSelectorChange?: (event: Event, size: number) => boolean | void;
  afterSizeSelectorChange?: (event: Event, size: number) => void;
  beforeDisable?: (type: string) => boolean | void;
  afterDisable?: (type: string) => void;
  beforeEnable?: (type: string) => boolean | void;
  afterEnable?: (type: string) => void;
  beforeDestroy?: () => boolean | void;
  afterDestroy?: () => void;
  disabled?: boolean;
  className?: string;
  ulClassName?: string;
  prevClassName?: string;
  nextClassName?: string;
  pageClassName?: string;
  header?: string | ((currentPage: number, totalPage: number, totalNumber: number) => string);
  footer?: string | ((currentPage: number, totalPage: number, totalNumber: number) => string);
  formatSizeChanger?: string | ((length: string, total: number) => string);
  alias?: {
    pageNumber?: string;
    pageSize?: string;
  };
}

export interface AjaxOptions {
  url: string;
  type?: 'GET' | 'POST';
  data?: any;
  contentType?: string;
  dataType?: string;
  async?: boolean;
  cache?: boolean;
  pageNumberStartWithZero?: boolean;
}

export interface PaginationModel {
  pageNumber: number;
  pageSize: number;
  totalNumber: number;
  totalPage: number;
  disabled: boolean;
  el?: HTMLElement;
  originalResponse?: any;
}

export interface PaginationArgs {
  currentPage: number;
  pageRange: number;
  rangeStart: number;
  rangeEnd: number;
  pagesToShow: (number | string)[];
  totalPage: number;
}

export interface PaginationEvent {
  detail: {
    pageNumber: number;
    done?: (event?: any) => void;
  };
}

export type PaginationCallback = (data: any, model: PaginationModel) => void;
export type PaginationHook = (...args: any[]) => boolean | void;
