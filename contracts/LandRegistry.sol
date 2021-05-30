// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.5.16;

contract LandRegistry {
    address public superAdmin;
    struct Property {
        address currentOwner;
        uint256 marketvalue;
        string landtype;
        string citytown;
        string district;
        string state;
        address registeredBy;
    }

    mapping(uint256 => Property) public properties;
    mapping(uint256 => address) public propertyChange;
    mapping(uint256 => address) public ownershipChange;
    mapping(address => int256) public mods;

    constructor() public {
        superAdmin = msg.sender;
        mods[superAdmin] = 1;
    }

    modifier onlyOwner(uint256 _survey) {
        require(properties[_survey].currentOwner == msg.sender);
        _;
    }

    modifier onlyHolder(uint256 _survey) {
        require(propertyChange[_survey] == msg.sender);
        _;
    }

    modifier onlyAdmin() {
        require(mods[msg.sender] == 2);
        _;
    }

    modifier onlySuperAdmin() {
        require(mods[msg.sender] == 1);
        _;
    }

    function createProperty(
        uint256 _survey,
        address _owner,
        uint256 _marketvalue,
        string memory _landtype,
        string memory _citytown,
        string memory _district,
        string memory _state
    ) public onlyAdmin returns (bool) {
        properties[_survey] = Property(
            _owner,
            _marketvalue,
            _landtype,
            _citytown,
            _district,
            _state,
            msg.sender
        );
        return true;
    }

    function givePermission(uint256 _survey, address _newHolder)
        public
        onlyOwner(_survey)
        returns (bool)
    {
        propertyChange[_survey] = _newHolder;
        return true;
    }

    function notForSale(uint256 _survey)
        public
        onlyOwner(_survey)
        returns (bool)
    {
        propertyChange[_survey] = address(0);
        return true;
    }

    function changeOwnership(uint256 _survey, address _owner)
        public
        onlyHolder(_survey)
        returns (bool)
    {
        require(properties[_survey].currentOwner == _owner);
        properties[_survey].currentOwner = msg.sender;
        propertyChange[_survey] = address(0);
        return true;
    }

    function getPropertyDetails(uint256 _survey)
        public
        view
        onlyOwner(_survey)
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        return (
            properties[_survey].landtype,
            properties[_survey].citytown,
            properties[_survey].district,
            properties[_survey].state,
            properties[_survey].marketvalue
        );
    }

    function addAdmin(address _newAdmin) public onlySuperAdmin returns (bool) {
        require(mods[_newAdmin] == 0);
        mods[_newAdmin] = 2;
        return true;
    }
}
