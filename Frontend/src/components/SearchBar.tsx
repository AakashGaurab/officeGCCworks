import { useState, type ChangeEvent, type FormEvent } from 'react';
import { SEARCH_INPUT_ID } from '../constants/AppConstants';
import { HeaderText } from '../constants/Text';
import { normalizeSearchTerm } from '../utils/normalizeSearchTerm';
import './SearchBar.css';

type SearchBarProps = {
  initialTerm: string;
  onSearch: (term: string) => void;
};

const SearchBar = ({ initialTerm, onSearch }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(initialTerm);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = normalizeSearchTerm(inputValue);
    // An empty search would just list everything or nothing; ignoring it is the least surprising.
    if (!term) return;
    onSearch(term);
  };

  return (
    <form className="search-bar" role="search" aria-label={HeaderText.SEARCH_ROLE_LABEL} onSubmit={handleSearchSubmit}>
      <label className="visually-hidden" htmlFor={SEARCH_INPUT_ID}>
        {HeaderText.SEARCH_LABEL}
      </label>
      <input
        id={SEARCH_INPUT_ID}
        className="search-bar-input"
        type="search"
        value={inputValue}
        placeholder={HeaderText.SEARCH_PLACEHOLDER}
        onChange={handleSearchChange}
      />
      <button className="button" type="submit">
        {HeaderText.SEARCH_BUTTON}
      </button>
    </form>
  );
};

export default SearchBar;
