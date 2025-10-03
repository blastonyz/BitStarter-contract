// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CrowdVotingToken is ERC20 {

    struct Milestone {
        string description;
        uint256 amount;
        bool released;
        uint256 votes;
        mapping(address => bool) voted; // quién ya votó
        address[] voters;               // lista de votantes
    }

    struct Project {
        string title;
        address creator;
        uint256 totalRaised;
        uint256 goal;
        Milestone[] milestones;
    }

    Project[] public projects;
    address[] public stakeholders; // lista de addresses con derecho a voto

    event ProjectCreated(uint256 indexed id, address indexed creator, string title, uint256 goal);
    event Contributed(uint256 indexed id, address indexed contributor, uint256 amount);
    event Voted(uint256 indexed id, uint256 milestoneIndex, address voter);
    event FundsReleased(uint256 indexed id, uint256 milestoneIndex, uint256 amount);

    constructor(address[] memory _stakeholders) ERC20("CrowdVoteToken", "CVT") {
        _mint(msg.sender, 1_000_000 ether);
        stakeholders = _stakeholders;
    }

    function createProject(
        string memory title,
        uint256 goal,
        string[] memory milestoneDescriptions,
        uint256[] memory milestoneAmounts
    ) external returns (uint256) {
        require(milestoneDescriptions.length == milestoneAmounts.length, "Mismatch");
        Project storage p = projects.push();
        p.title = title;
        p.creator = msg.sender;
        p.goal = goal;

        for (uint i = 0; i < milestoneDescriptions.length; i++) {
            Milestone storage m = p.milestones.push();
            m.description = milestoneDescriptions[i];
            m.amount = milestoneAmounts[i];
            m.released = false;
        }
        emit ProjectCreated(projects.length - 1, msg.sender, title, goal);
        return projects.length - 1;
    }

    function contribute(uint256 projectId, uint256 amount) external {
        _transfer(msg.sender, address(this), amount);
        Project storage p = projects[projectId];
        p.totalRaised += amount;
        emit Contributed(projectId, msg.sender, amount);
    }

    function voteMilestone(uint256 projectId, uint256 milestoneIndex) external {
        Project storage p = projects[projectId];
        Milestone storage m = p.milestones[milestoneIndex];
        require(!m.released, "Already released");
        require(!m.voted[msg.sender], "Already voted");

        // sólo stakeholders pueden votar
        bool canVote = false;
        for (uint i=0;i<stakeholders.length;i++){
            if (stakeholders[i] == msg.sender) {canVote = true;break;}
        }
        require(canVote,"Not allowed");

        m.voted[msg.sender] = true;
        m.votes++;
        m.voters.push(msg.sender);
        emit Voted(projectId, milestoneIndex, msg.sender);

        // si mayoría > 50%
        if (m.votes * 2 > stakeholders.length) {
            _releaseFunds(p, m, milestoneIndex, projectId);
        }
    }

    function _releaseFunds(Project storage p, Milestone storage m, uint256 milestoneIndex, uint256 projectId) internal {
        require(!m.released, "Already released");
        m.released = true;
        _transfer(address(this), p.creator, m.amount);
        emit FundsReleased(projectId, milestoneIndex, m.amount);
    }

    function getProject(uint256 id) external view returns (
        string memory title,
        address creator,
        uint256 totalRaised,
        uint256 goal
    ) {
        Project storage p = projects[id];
        return (p.title, p.creator, p.totalRaised, p.goal);
    }

    function getMilestoneVotes(uint256 projectId, uint256 milestoneIndex) external view returns (uint256, address[] memory) {
        Milestone storage m = projects[projectId].milestones[milestoneIndex];
        return (m.votes, m.voters);
    }
}
