// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract LiveStreaming {
    uint nextStreamId;
    mapping(uint => Stream) streams;
    mapping(uint => uint[]) watchesByStream;
    mapping(address => bool) whitelist;
    mapping(address => uint) public balances;
    mapping(uint256 => address payable) streamCreators;
    mapping(uint => Comment[]) commentsByStream;

    struct Stream {
        address owner;
        bool isActive;
        uint watchFee;
        uint StreamID;
    }

    struct Comment {
        address commenter;
        string message;
    }


    event StreamCreated(uint indexed streamId, address indexed owner);
    event StreamDeactivated(uint indexed streamId, address indexed owner);
    event WatcherAdded(uint indexed streamId, address indexed watcher);
    event Tipped(uint indexed streamId, address indexed tipper, uint amount);
    event CommentAdded(uint indexed streamId, address indexed commenter, string content);

    function createStream(uint watchFee) external returns (uint streamId) {
        streamId = nextStreamId;
        streams[streamId] = Stream(msg.sender, true, watchFee, streamId);
        streamCreators[streamId] = payable(msg.sender);
        nextStreamId++;
        emit StreamCreated(streamId, msg.sender);
    }

    function deactivateStream(uint streamId) external {
        require(streams[streamId].owner == msg.sender, "Only the stream owner can deactivate the stream");
        require(streams[streamId].isActive, "The stream is already inactive");

        streams[streamId].isActive = false;

        emit StreamDeactivated(streamId, msg.sender);
    }

    function joinStream(uint streamId) external payable {
        require(streams[streamId].isActive, "The stream is not active");
        require(msg.value >= streams[streamId].watchFee, "Incorrect watch fee");

        // Add the watcher to the whitelist
        whitelist[msg.sender] = true;
        
        // Calculate the streamer's share and transfer the funds
        address payable creator = payable(streamCreators[streamId]);
        uint streamerShare = msg.value * 95 / 100; // Streamer gets 95%, platform takes 5%
        creator.transfer(streamerShare);

        // Add the watch fee to the platform's balance
        balances[address(this)] += msg.value - streamerShare;

        // Add the watcher to the list of viewers
        watchesByStream[streamId].push(uint(uint160(msg.sender)));

        emit WatcherAdded(streamId, msg.sender);
    }

    
    function addComment(uint streamId, string memory content) external {
        require(streams[streamId].isActive, "The stream is not active");
        require(whitelist[msg.sender], "Only viewers can add comments");

        commentsByStream[streamId].push(Comment(msg.sender, content));

        emit CommentAdded(streamId, msg.sender, content);
    }


    function getWatchesByStream(uint streamId) external view returns (uint[] memory, address[] memory) {
        uint[] memory watchIds = watchesByStream[streamId];
        address[] memory watchers = new address[](watchIds.length);

        for (uint i = 0; i < watchIds.length; i++) {
            address payable watcher = payable(address(uint160(watchIds[i])));
            watchers[i] = watcher;
        }

        return (watchIds, watchers);
    }

    function getCommentsByStreamId(uint streamId) external view returns (Comment[] memory) {
        return commentsByStream[streamId];
    }


    function isWhitelisted(address user) external view returns (bool) {
        return whitelist[user];
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function tip(uint streamId) external payable {
        require(streams[streamId].isActive, "The stream is not active");
        require(msg.value > 0, "Tip amount must be greater than zero");

        address payable creator = streamCreators[streamId];
        creator.transfer(msg.value);

        emit Tipped(streamId, msg.sender, msg.value);
    }

    function getStreamIds() public view returns (uint[] memory) {
        uint[] memory streamIds = new uint[](nextStreamId);
        for (uint i = 0; i < nextStreamId; i++) {
            streamIds[i] = i;
        }
        return streamIds;
    }

    function getStreamByID(uint streamId) external view returns (Stream memory) {
        require(streamId < nextStreamId, "Invalid stream ID");
        return streams[streamId];
    }




    receive() external payable {
        balances[msg.sender] += msg.value;
    }

    fallback() external payable {
    balances[msg.sender] += msg.value;
    }

    

    
}