import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddFoodForm } from './AddFoodForm';
import { useFood } from '@/hooks/useFoodApi';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/hooks/useFoodApi', () => ({
  useFood: vi.fn(),
}));

describe('AddFoodForm', () => {
  const mockAddFoodItem = vi.fn();
  const mockFetchFoodItemsByDate = vi.fn();

  beforeEach(() => {
    (useFood as any).mockReturnValue({
      addFoodItem: mockAddFoodItem,
      fetchFoodItemsByDate: mockFetchFoodItemsByDate,
    });
  });

  it('не отправляет форму, если поле "Название" пустое', async () => {
    render(<AddFoodForm selectedDate={new Date('2025-04-20')} />);
    fireEvent.click(screen.getByText(/Добавить продукт или блюдо/i));
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    expect(mockAddFoodItem).not.toHaveBeenCalled();
  });

  it('вызывает addFoodItem и fetchFoodItemsByDate при корректном заполнении', async () => {
    render(<AddFoodForm selectedDate={new Date('2025-04-20')} />);
    fireEvent.click(screen.getByText(/Добавить продукт или блюдо/i));
    fireEvent.change(screen.getByLabelText(/Название/i), { target: { value: 'Тестовый продукт' } });
    fireEvent.change(screen.getByLabelText(/Порция \(г\)/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Калории/i), { target: { value: '250' } });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    const breakfastOption = await screen.findByRole('option', { name: /Завтрак/i });
    fireEvent.click(breakfastOption);
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockAddFoodItem).toHaveBeenCalledTimes(1);
      expect(mockFetchFoodItemsByDate).toHaveBeenCalledTimes(1);
    });
  });
});