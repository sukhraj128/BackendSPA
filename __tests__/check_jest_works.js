test('Jest should use the test DB', ()=> {
  expect(process.env.DB_DATABASE).toBe('test_db');
})
