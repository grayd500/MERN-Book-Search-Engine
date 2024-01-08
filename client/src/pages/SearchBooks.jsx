// client/src/pages/SearchBooks.jsx:
import { useState, useEffect } from 'react';
import { Container, Col, Form, Button, Card, Row, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';

import Auth from '../utils/auth';
import { SAVE_BOOK } from '../utils/mutations';
import { getSavedBookIds, saveBookIds } from '../utils/localStorage';
import { searchGoogleBooks } from '../utils/API';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [saveBook, { error }] = useMutation(SAVE_BOOK);

  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  }, [savedBookIds]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      const { items } = await response.json();
      const books = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        link: book.volumeInfo.infoLink,
      }));

      setSearchedBooks(books);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId) => {
    if (!Auth.loggedIn()) {
      console.log("Please log in to save books.");
      return;
    }

    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    if (!bookToSave) {
      return;
    }

    try {
      await saveBook({
        variables: {
          input: {
            authors: bookToSave.authors,
            description: bookToSave.description,
            title: bookToSave.title,
            bookId: bookToSave.bookId,
            image: bookToSave.image,
            link: bookToSave.link
          },
        },
      });

      setSavedBookIds([...savedBookIds, bookId]);
      setShowSuccessAlert(true); // Set the success alert to true
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Container>
        {showSuccessAlert && (
          <Alert variant="success" onClose={() => setShowSuccessAlert(false)} dismissible>
            Book saved successfully!
          </Alert>
        )}
        {error && <Alert variant="danger">An error occurred: {error.message}</Alert>}
        <h1>Search for Books!</h1>
        <Form onSubmit={handleFormSubmit}>
          <Row>
            <Col xs={12} md={8}>
              <Form.Control
                name='searchInput'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                type='text'
                size='lg'
                placeholder='Search for a book'
              />
            </Col>
            <Col xs={12} md={4}>
              <Button type='submit' variant='success' size='lg'>
                Submit Search
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>

      <Container>
        <Row>
        {searchedBooks.map((book) => (
  <Col key={book.bookId} xs={12} md={4}>
    <Card>
      <a href={book.link} target="_blank" rel="noopener noreferrer">
        <Card.Img src={book.image} alt={`The cover for ${book.title}`} />
      </a>
      <Card.Body>
        <Card.Title>
          <a href={book.link} target="_blank" rel="noopener noreferrer">
            {book.title}
          </a>
        </Card.Title>
        <p>{book.authors.join(', ')}</p>
        <Card.Text>{book.description}</Card.Text>
        <Button 
          disabled={savedBookIds.includes(book.bookId)}
          onClick={() => handleSaveBook(book.bookId)}
          variant='primary'>
          {savedBookIds.includes(book.bookId) ? 'Saved' : 'Save'}
        </Button>
      </Card.Body>
    </Card>
  </Col>
))}

        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;