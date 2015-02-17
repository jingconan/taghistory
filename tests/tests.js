QUnit.test('groupItemsByDescendingTimestamps', function (assert) {
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
 
