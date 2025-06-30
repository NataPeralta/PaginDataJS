/// <reference types="vitest/globals" />
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {PaginationCore} from '../src/pagination-core';

// Usa jsdom para este archivo
vi.stubGlobal('document', globalThis.document);
vi.stubGlobal('window', globalThis.window);

// Simula un DOM para los tests
beforeEach(() => {
  document.body.innerHTML = '';
  const container = document.createElement('div');
  container.id = 'pagination-container';
  document.body.appendChild(container);
});

describe('PaginationCore', () => {
  it('debería inicializar con la página 1 por defecto', async () => {
    const pagination = new PaginationCore('#pagination-container', {totalNumber: 100});
    await pagination.init();
    expect(pagination.getModel().pageNumber).toBe(1);
  });

  it('debería cambiar de página correctamente', async () => {
    const pagination = new PaginationCore('#pagination-container', {totalNumber: 100});
    await pagination.init();
    await pagination.goToPage(3);
    expect(pagination.getModel().pageNumber).toBe(3);
  });

  it('debería renderizar el número correcto de páginas', async () => {
    const pagination = new PaginationCore('#pagination-container', {totalNumber: 50, pageSize: 10});
    await pagination.init();
    const pageButtons = document.querySelectorAll('.paginationjs-page');
    expect(pageButtons.length).toBe(5);
  });

  it('debería navegar a la página anterior y siguiente', async () => {
    const pagination = new PaginationCore('#pagination-container', {totalNumber: 30, pageSize: 10});
    await pagination.init();
    await pagination.goToPage(2);
    expect(pagination.getModel().pageNumber).toBe(2);
    await pagination.goToPreviousPage();
    expect(pagination.getModel().pageNumber).toBe(1);
    await pagination.goToNextPage();
    expect(pagination.getModel().pageNumber).toBe(2);
  });

  it('debería ir a la primera y última página', async () => {
    const pagination = new PaginationCore('#pagination-container', {
      totalNumber: 100,
      pageSize: 10,
    });
    await pagination.init();
    await pagination.goToLastPage();
    expect(pagination.getModel().pageNumber).toBe(10);
    await pagination.goToFirstPage();
    expect(pagination.getModel().pageNumber).toBe(1);
  });

  it('debería ejecutar el callback al cambiar de página', async () => {
    const callback = vi.fn();
    const pagination = new PaginationCore('#pagination-container', {
      totalNumber: 100,
      callback,
    });
    await pagination.init();
    await pagination.goToPage(2);
    expect(callback).toHaveBeenCalled();
  });

  it('debería cambiar el tamaño de página correctamente', async () => {
    const pagination = new PaginationCore('#pagination-container', {
      totalNumber: 100,
      pageSize: 10,
    });
    await pagination.init();
    await pagination.setPageSize(25);
    expect(pagination.getModel().pageSize).toBe(25);
    expect(pagination.getModel().pageNumber).toBe(1); // Debe resetear a la primera página
  });

  it('debería personalizar textos y clases', async () => {
    const pagination = new PaginationCore('#pagination-container', {
      totalNumber: 20,
      prevText: 'Anterior',
      nextText: 'Siguiente',
      classPrefix: 'custom-pagination',
      activeClassName: 'custom-active',
      disableClassName: 'custom-disabled',
    });
    await pagination.init();
    const prev = document.querySelector('.custom-pagination-prev');
    const next = document.querySelector('.custom-pagination-next');
    expect(prev?.textContent).toContain('Anterior');
    expect(next?.textContent).toContain('Siguiente');
  });

  it('debería renderizar elipsis cuando corresponde', async () => {
    const pagination = new PaginationCore('#pagination-container', {
      totalNumber: 200,
      pageSize: 10,
      showEllipsis: true,
    });
    await pagination.init();
    const ellipsis = document.querySelectorAll('.paginationjs-ellipsis');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('debería funcionar con datos remotos (fetch)', async () => {
    // Mock de fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        data: Array.from({length: 100}, (_, i) => ({id: i + 1, name: `Persona ${i + 1}`})),
      }),
      ok: true,
    });
    const callback = vi.fn();
    const pagination = new PaginationCore('#pagination-container', {
      dataSource: async (cb: any) => {
        const res = await fetch('https://fakerapi.it/api/v2/persons?_quantity=100');
        const json = await res.json();
        cb(json.data);
      },
      totalNumber: 100,
      pageSize: 10,
      callback,
    });
    await pagination.init();
    expect(callback).toHaveBeenCalled();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://fakerapi.it/api/v2/persons?_quantity=100'
    );
  });
});
