import {PaginationOptions, PaginationModel} from '../types';

export class EventHandler {
  private options: PaginationOptions;
  private model: PaginationModel;
  private el: HTMLElement;

  constructor(options: PaginationOptions, model: PaginationModel, el: HTMLElement) {
    this.options = options;
    this.model = model;
    this.el = el;
  }

  bindEvents(): void {
    this.bindPageClick();
    this.bindSizeChanger();
    this.bindGoButton();
    this.bindGoInput();
    this.bindEllipsisEvents();
  }

  private bindPageClick(): void {
    const classPrefix = this.options.classPrefix || 'paginationjs';

    this.el.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Manejar clic en páginas
      const pageElement = target.closest(`.${classPrefix}-page`) as HTMLElement;
      if (
        pageElement &&
        !pageElement.classList.contains(this.options.disableClassName || 'disabled')
      ) {
        const pageNumber = parseInt(pageElement.getAttribute('data-num') || '1');
        this.goToPage(pageNumber);
        return;
      }

      // Manejar clic en botón anterior
      const prevElement = target.closest(`.${classPrefix}-prev`) as HTMLElement;
      if (
        prevElement &&
        !prevElement.classList.contains(this.options.disableClassName || 'disabled')
      ) {
        const pageNumber = parseInt(prevElement.getAttribute('data-num') || '1');
        this.goToPage(pageNumber);
        return;
      }

      // Manejar clic en botón siguiente
      const nextElement = target.closest(`.${classPrefix}-next`) as HTMLElement;
      if (
        nextElement &&
        !nextElement.classList.contains(this.options.disableClassName || 'disabled')
      ) {
        const pageNumber = parseInt(nextElement.getAttribute('data-num') || '1');
        this.goToPage(pageNumber);
        return;
      }
    });
  }

  private bindSizeChanger(): void {
    if (!this.options.showSizeChanger) return;

    const classPrefix = this.options.classPrefix || 'paginationjs';
    const sizeSelector = this.el.querySelector(`.${classPrefix}-size-select`) as HTMLSelectElement;

    if (sizeSelector) {
      sizeSelector.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const size = parseInt(target.value);

        if (this.options.beforeSizeSelectorChange) {
          const result = this.options.beforeSizeSelectorChange(e, size);
          if (result === false) return;
        }

        this.model.pageSize = size;
        this.model.pageNumber = 1;
        this.triggerPaging();

        if (this.options.afterSizeSelectorChange) {
          this.options.afterSizeSelectorChange(e, size);
        }
      });
    }
  }

  private bindGoButton(): void {
    if (!this.options.showGoButton) return;

    const classPrefix = this.options.classPrefix || 'paginationjs';
    const goButton = this.el.querySelector(`.${classPrefix}-go-button`) as HTMLInputElement;

    if (goButton) {
      goButton.addEventListener('click', (e) => {
        const pageNumber = this.getGoInputValue();

        if (this.options.beforeGoButtonOnClick) {
          const result = this.options.beforeGoButtonOnClick(e, pageNumber);
          if (result === false) return;
        }

        this.goToPage(parseInt(pageNumber));

        if (this.options.afterGoButtonOnClick) {
          this.options.afterGoButtonOnClick(e, pageNumber);
        }
      });
    }
  }

  private bindGoInput(): void {
    if (!this.options.showGoInput) return;

    const classPrefix = this.options.classPrefix || 'paginationjs';
    const goInput = this.el.querySelector(`.${classPrefix}-go-pagenumber`) as HTMLInputElement;

    if (goInput) {
      goInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const pageNumber = this.getGoInputValue();

          if (this.options.beforeGoInputOnEnter) {
            const result = this.options.beforeGoInputOnEnter(e, pageNumber);
            if (result === false) return;
          }

          this.goToPage(parseInt(pageNumber));

          if (this.options.afterGoInputOnEnter) {
            this.options.afterGoInputOnEnter(e, pageNumber);
          }
        }
      });
    }
  }

  private getGoInputValue(): string {
    const classPrefix = this.options.classPrefix || 'paginationjs';
    const goInput = this.el.querySelector(`.${classPrefix}-go-pagenumber`) as HTMLInputElement;
    return goInput ? goInput.value : '1';
  }

  private goToPage(pageNumber: number): void {
    const totalPage = Math.ceil(this.model.totalNumber / this.model.pageSize);

    if (pageNumber < 1) {
      pageNumber = 1;
    } else if (pageNumber > totalPage) {
      pageNumber = totalPage;
    }

    if (pageNumber !== this.model.pageNumber) {
      this.model.pageNumber = pageNumber;
      this.triggerPaging();
    }
  }

  private triggerPaging(): void {
    const event = new CustomEvent('pagination', {
      detail: {
        pageNumber: this.model.pageNumber,
      },
    });

    this.el.dispatchEvent(event);
  }

  private bindEllipsisEvents(): void {
    if (!this.options.ellipsisClickable) return;

    const classPrefix = this.options.classPrefix || 'paginationjs';

    // Manejar clicks en botones de elipsis
    this.el.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      const ellipsisButton = target.closest(`.${classPrefix}-ellipsis-go-btn`) as HTMLElement;
      if (ellipsisButton) {
        const ellipsisContainer = ellipsisButton.closest(`.${classPrefix}-ellipsis`) as HTMLElement;
        const input = ellipsisContainer.querySelector(
          `.${classPrefix}-ellipsis-page-input`
        ) as HTMLInputElement;

        if (input && input.value) {
          const pageNumber = parseInt(input.value);
          this.goToPage(pageNumber);
          input.value = ''; // Limpiar input después de usar
        }
      }
    });

    // Manejar entrada en inputs de elipsis
    this.el.addEventListener('keypress', (e) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains(`${classPrefix}-ellipsis-page-input`) && e.key === 'Enter') {
        const input = target as HTMLInputElement;
        if (input.value) {
          const pageNumber = parseInt(input.value);
          this.goToPage(pageNumber);
          input.value = ''; // Limpiar input después de usar
        }
      }
    });
  }
}
