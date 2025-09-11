import React from 'react';
import BudgetManager from './BudgetManager';

const BudgetsView = ({ budgets, onAddBudget, onUpdateBudget, onDeleteBudget }) => {
  return (
    <BudgetManager 
      budgets={budgets}
      onAddBudget={onAddBudget}
      onUpdateBudget={onUpdateBudget}
      onDeleteBudget={onDeleteBudget}
    />
  );
};

export default BudgetsView;