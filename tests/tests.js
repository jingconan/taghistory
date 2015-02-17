QUnit.test('Util.groupItemsByDescendingTimestamps', function (assert) {
    assert.deepEqual(Util.groupItemsByDescendingTimestamps([6, 5, 2, 1], 4), 
        [[0, 1, 2, 3]], 'delta = 4');

    assert.deepEqual(Util.groupItemsByDescendingTimestamps([6, 5, 2, 1], 3), 
        [[0, 1], [2, 3]], 'delta = 3');

    assert.deepEqual(Util.groupItemsByDescendingTimestamps([4, 3, 2, 1], 2), 
        [[0, 1, 2, 3]], 'equally spcaed, delta = 2');

    assert.deepEqual(Util.groupItemsByDescendingTimestamps([4, 3, 2, 1], 1), 
        [[0], [1], [2], [3]], 'equally spaced, delta = 1');

    assert.deepEqual(Util.groupItemsByDescendingTimestamps([1, 0, -1, -2], 1), 
        [[0], [1], [2], [3]], 'equally spaced, both positive and negative, delta = 1');

});
 

QUnit.test('Util.parseURL', function (assert) {
    assert.deepEqual(Util.parseURL('http://www.google.com/index.html'),
        {host: 'www.google.com/', path: 'index.html'}, 'Util.parseURL www.google.com');

    assert.deepEqual(Util.parseURL('https://yahoo.com/news'),
        {host: 'yahoo.com/', path: 'news'}, 'Util.parseURL, normal format');

    assert.deepEqual(Util.parseURL('https://yahoo.com/news//'),
        {host: 'yahoo.com/', path: 'news//'}, 'Util.parseURL, ends with two slashes');

    assert.deepEqual(Util.parseURL('https://yahoo.com/news/2015-02/'),
        {host: 'yahoo.com/', path: 'news/2015-02/'}, 'Util.parseURL, has dates');
});


QUnit.test('Util.truncStr', function (assert) {
    assert.strictEqual(Util.truncStr('hello', 6), 'hello', 'no truncation');
    assert.strictEqual(Util.truncStr('hello', 5), 'hello', 'no truncation');
    assert.strictEqual(Util.truncStr('hello', 4), 'hell...', 'truncate one char');
    assert.strictEqual(Util.truncStr('c', 1), 'c', 'single char no truncation');
    assert.strictEqual(Util.truncStr('c', 0), '...', 'single char no truncation');
});