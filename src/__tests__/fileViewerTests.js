'use strict';

var React = require('react'), //eslint-disable-line no-unused-vars
	ReactDOM = require( 'react-dom' ),
	TestUtils = require( 'react-addons-test-utils' ),
	FileViewer = require('../fileViewer'),
	sinon = require('sinon'),
	i18n = require('react-frau-intl').i18n,
	FileViewerResolved = require('../fileViewerResolved'),
	IntlFileViewer = i18n(FileViewerResolved);

var providerStub;

describe('FileViewer', function() {
	beforeEach(function() {
		providerStub = sinon.stub();
		providerStub.withArgs('file1.gif').callsArgWith(1, null, {size: 1, mimeType: 'image/gif', filename: 'file1.gif'});
		providerStub.withArgs('file2.mp3').callsArgWith(1, null, {size: 100, mimeType: 'audio/mp3', filename: 'file2.mp3'});
		providerStub.withArgs('foo.bar').callsArgWith(1, 'error1');

		FileViewer.__Rewire__('IntlFileViewer', 'div');
		FileViewer.__Rewire__('fileInfoProvider', providerStub);
	});

	it('should get file info from provider', function() {
		TestUtils.renderIntoDocument(
			<FileViewer src="foo.bar" />
		);

		expect(providerStub.calledOnce).toBe(true);
		expect(providerStub.calledWith('foo.bar')).toBe(true);
	});

	it('should pass an undefined mimeType to the viewer if the provider fails', function() {
		FileViewer.__Rewire__('IntlFileViewer', IntlFileViewer);

		var elem = TestUtils.renderIntoDocument(
			<FileViewer src="foo.bar" />
		);

		var fileViewerResolvedComponent = TestUtils.findRenderedComponentWithType(
			elem,
			FileViewerResolved
		);
		expect(fileViewerResolvedComponent.props.mimeType).toBe(undefined);
	});

	it('should render nothing if file info is null', function() {
		var elem = TestUtils.renderIntoDocument(
			<FileViewer src="file3.null" />
		);
		expect(ReactDOM.findDOMNode(elem)).toBeNull();
	});

	it('should render something if file info is not null', function() {
		var elem = TestUtils.renderIntoDocument(
			<FileViewer src="file1.gif" />
		);
		expect(ReactDOM.findDOMNode(elem)).not.toBeNull();
	});

	it('should update file info when src changes', function() {
		var elem = TestUtils.renderIntoDocument(
			<FileViewer src="file1.gif" />
		);

		ReactDOM.render( <FileViewer src = 'file2.mp3' />, ReactDOM.findDOMNode( elem ).parentNode );
		expect(elem.state.info.mimeType).toBe('audio/mp3');
	});

	it('should not re-fetch file info if src does not change', function() {
		var elem = TestUtils.renderIntoDocument(
			<FileViewer src="file1.gif" />
		);

		ReactDOM.render( <FileViewer src = 'file1.gif' />, ReactDOM.findDOMNode( elem ).parentNode );
		expect(providerStub.calledOnce).toBe(true);
	});

	it('should not set state when unmounted', function() {
		var elem = TestUtils.renderIntoDocument(
			<FileViewer src="file1.gif" />
		);
		ReactDOM.unmountComponentAtNode(
			ReactDOM.findDOMNode(elem).parentNode
		);
		elem.fetchFileInfo('file2.mp3');
		expect(elem.state.info.mimeType).toBe('image/gif');
	});

	it('should pass locale to FileViewerResolved', function() {
		FileViewer.__Rewire__('IntlFileViewer', IntlFileViewer);
		var wrapper = TestUtils.renderIntoDocument(
			<FileViewer src='file1.gif' locale='en-ca' />
		);

		var fileViewerResolvedComponent = TestUtils.findRenderedComponentWithType(
			wrapper,
			FileViewerResolved
		);
		expect(fileViewerResolvedComponent.props.locale).toBe('en-ca');
	});
});
