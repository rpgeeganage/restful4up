#!/usr/bin/python3

import requests
from os.path import isdir, isfile, join, basename
import logging
from time import sleep
import sys

class restful4up():

	def __init__(self, HOST = None):
		self.API_HOST = f'{HOST}/v1'
		self.RATE_LIMIT = 5
		if self.API_HOST is None:
			raise ValueError('Please provide the API HOST')

	def unpack(self, path):
		return self.getFile(path, 'unpack')

	def emulationOutput(self, path):
		return self.getFile(path, 'emulation-output')

	def clean(self):
		try:
			response = requests.head(f'{self.API_HOST}/clean')
			response.raise_for_status()
		except requests.exceptions.HTTPError as err:
			raise ValueError(err.response.message)
		except requests.exceptions.Timeout:
			raise ValueError('timed out')
		except requests.exceptions.RequestException as err:
			raise ValueError(err)

	def getFile(self, path, endpoint):
		if isdir(path):
			raise ValueError('The path specified appears to be a directory and not a file.')
		elif not isfile(path):
			raise ValueError('The file specified for upload does not exist.')

		file_data = None

		logging.debug(f'Reading {basename(path)} into memory.')
		with open(path, "rb") as f:
			file_data = f.read()
		
		file_size = len(file_data)

		files = {'file': (basename(path), file_data)}

		response = None
		logging.info('Uploading %s (%s bytes) to API' % (path, file_size))

		try:
			response = requests.post(f'{self.API_HOST}/{endpoint}', files=files)
			response.raise_for_status()
		except requests.exceptions.HTTPError as err:
			raise ValueError(err.response.message)
		except requests.exceptions.Timeout:
			raise ValueError('timed out')
		except requests.exceptions.RequestException as err:
			raise ValueError(err)

		return response.content