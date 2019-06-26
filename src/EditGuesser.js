import React from 'react';
import {EditController} from 'ra-core';
import {SimpleForm} from 'ra-ui-materialui';
import {Query, EditView} from 'react-admin';
import inputFactory from './inputFactory';

const existsAsChild = children => {
  const childrenNames = new Set(
    React.Children.map(children, child => child.props.name),
  );

  return ({name}) => !childrenNames.has(name);
};

export const EditViewGuesser = props => {
  const {api, resource, children} = props;
  const resourceSchema = api.resources.find(r => r.name === resource);

  if (
    !resourceSchema ||
    !resourceSchema.fields ||
    !resourceSchema.fields.length
  ) {
    throw new Error('Resource not present inside api description');
  }

  const inferredElements = resourceSchema.fields
    .map(field => inputFactory(field, {resource}))
    .filter(existsAsChild(children));

  return (
    <EditView {...props}>
      <SimpleForm>
        {children}
        {inferredElements}
      </SimpleForm>
    </EditView>
  );
};

EditViewGuesser.propTypes = EditView.propTypes;

const EditGuesser = props => (
  <Query type="INTROSPECT" resource={props.ressource}>
    {({data, loading, error}) => {
      if (loading) {
        return <div>LOADING</div>;
      }

      if (error) {
        console.error(error);
        return <div>ERROR</div>;
      }

      return (
        <EditController {...props}>
          {controllerProps => (
            <EditViewGuesser api={data} {...controllerProps} />
          )}
        </EditController>
      );
    }}
  </Query>
);

export default EditGuesser;
